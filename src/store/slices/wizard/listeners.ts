import { backendApi } from '@/store/api/backend';
import type { WizardListenerEffect } from '@/store/middleware/types';

import { selectIsImageMode } from './details';
import {
  changeImageTypes,
  isRhel,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from './output';
import {
  changeAapEnabled,
  changeRegistrationType,
  registrationState,
  selectAapEnabled,
  selectRegistrationType,
} from './registration';

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

// This was previously a mutation inside the changeDistribution reducer.
// As a listener it fires *after* the reducer commits, so any other listener
// reading the `registration.type` in the same tick will observe the old value
// until this dispatch is processed.
export const registerLater: WizardListenerEffect = (_action, listenerApi) => {
  const state = listenerApi.getState();
  const distribution = selectDistribution(state);

  // In image mode the distribution doesn't determine whether registration
  // is available — selecting a custom image dispatches changeDistribution
  // with a possibly non-RHEL distro and must not reset the registration.
  if (selectIsImageMode(state)) {
    return;
  }

  if (process.env.IS_ON_PREMISE && !isRhel(distribution)) {
    listenerApi.dispatch(changeRegistrationType('register-later'));
  }
};

// Satellite and Ansible Automation Platform registration are not supported
// for image mode yet, so a selection made in package mode must not carry
// over into the blueprint when the user switches modes.
export const clearUnsupportedRegistration: WizardListenerEffect = (
  _action,
  listenerApi,
) => {
  const state = listenerApi.getState();

  if (!selectIsImageMode(state)) {
    return;
  }

  if (selectRegistrationType(state) === 'register-satellite') {
    listenerApi.dispatch(changeRegistrationType(registrationState.type));
  }

  if (selectAapEnabled(state)) {
    listenerApi.dispatch(changeAapEnabled(false));
  }
};
