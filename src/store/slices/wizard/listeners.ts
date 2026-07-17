import { backendApi, composerApi } from '@/store/api/backend';
import type { OnPremState, RootState } from '@/store/index';
import type { WizardListenerEffect } from '@/store/middleware/types';

const isOnPremState = (state: RootState): state is OnPremState =>
  'onPremApi' in state;

import { selectIsImageMode } from './details';
import {
  changeArchitecture,
  changeDistribution,
  changeImageTypes,
  isRhel,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from './output';
import { changeRegistrationType } from './registration';

export const filterImageTypes: WizardListenerEffect = (
  _action,
  listenerApi,
) => {
  const state = listenerApi.getState();

  // Image-mode gets allowed types from bootc distributions, not getArchitectures
  if (selectIsImageMode(state)) {
    return;
  }

  const architecture = selectArchitecture(state);
  const distribution = selectDistribution(state);
  const imageTypes = selectImageTypes(state);
  const architectures = backendApi.endpoints.getArchitectures.select({
    distribution,
  })(
    // backendApi is conditionally assigned (composerApi | imageBuilderApi) so
    // its select() expects a concrete state shape, not the union that RootState is
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state as any,
  );

  const allowed = architectures.data?.find(
    (elem) => elem.arch === architecture,
  )?.image_types;

  listenerApi.dispatch(
    changeImageTypes(imageTypes.filter((t) => allowed?.includes(t))),
  );
};

// On-premise, re-apply the host's arch and distro after the wizard
// resets to defaults. The reducer sets initialState first, then this
// listener reads the cached getHostInfo result and dispatches the
// correct values.
export const applyHostInfo: WizardListenerEffect = (_action, listenerApi) => {
  if (!process.env.IS_ON_PREMISE) return;

  const state = listenerApi.getState();
  if (!isOnPremState(state)) return;

  const hostInfo = composerApi.endpoints.getHostInfo.select()(state);

  if (hostInfo.data) {
    listenerApi.dispatch(changeArchitecture(hostInfo.data.arch));
    listenerApi.dispatch(changeDistribution(hostInfo.data.distro));
  }
};

// This was previously a mutation inside the changeDistribution reducer.
// As a listener it fires *after* the reducer commits, so any other listener
// reading the `registration.type` in the same tick will observe the old value
// until this dispatch is processed.
export const registerLater: WizardListenerEffect = (_action, listenerApi) => {
  const state = listenerApi.getState();
  const distribution = selectDistribution(state);

  if (process.env.IS_ON_PREMISE && !isRhel(distribution)) {
    listenerApi.dispatch(changeRegistrationType('register-later'));
  }
};
