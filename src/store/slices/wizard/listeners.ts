import { backendApi, type Distributions } from '@/store/api/backend';
import { KNOWN_IMAGES } from '@/store/api/backend/onprem/constants';
import type { WizardListenerEffect } from '@/store/middleware/types';

import { selectIsImageMode } from './details';
import {
  changeDistribution,
  changeImageSource,
  changeImageTypes,
  changeIsoPayloadReference,
  isRhel,
  selectArchitecture,
  selectDistribution,
  selectImageSource,
  selectImageSourceType,
  selectImageTypes,
  selectIsoPayloadReference,
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

// On-prem, the target environment radios are the only way to choose an
// official image: each type maps to exactly one official image, so a
// type change resolves the image source and distribution. Guarded by
// IS_ON_PREMISE, a build-time constant, so the hosted bundle
// dead-code-eliminates it and can never have its image source
// rewritten.
export const resolveOfficialImage: WizardListenerEffect = (
  _action,
  listenerApi,
) => {
  if (!process.env.IS_ON_PREMISE) {
    return;
  }

  const state = listenerApi.getState();
  if (
    !selectIsImageMode(state) ||
    selectImageSourceType(state) !== 'official'
  ) {
    return;
  }

  const imageTypes = selectImageTypes(state);
  if (imageTypes.length === 0) {
    return;
  }
  const targetType = imageTypes[0];

  const currentRef = selectImageSource(state);
  const current = KNOWN_IMAGES.find((k) => k.reference === currentRef);
  // A set but unknown reference belongs to another flow (e.g. an
  // imported blueprint); leave it alone.
  if (currentRef && !current) {
    return;
  }

  // Prefer the sibling published under the same name, so a type change
  // stays within the same release once several are offered.
  const selected =
    current?.type === targetType
      ? current
      : ((current &&
          KNOWN_IMAGES.find(
            (k) => k.name === current.name && k.type === targetType,
          )) ??
        KNOWN_IMAGES.find((k) => k.type === targetType));
  if (!selected) {
    return;
  }

  if (selected !== current) {
    listenerApi.dispatch(changeImageSource(selected.reference));
    listenerApi.dispatch(changeDistribution(selected.distro as Distributions));
  }

  // The container installer needs a payload container; default to the
  // one the selected official image ships with.
  const payloadRef = selected.iso_payload_references?.[0];
  if (
    targetType === 'bootable-container-iso' &&
    payloadRef &&
    !selectIsoPayloadReference(state)
  ) {
    listenerApi.dispatch(changeIsoPayloadReference(payloadRef));
  }
};
