import { createListenerMiddleware } from '@reduxjs/toolkit';

import { WizardStartListening } from './types';

import {
  changeArchitecture,
  changeBlueprintMode,
  changeDistribution,
  changeImageTypes,
  changeRegistrationType,
} from '../slices/wizard';
// export from slices/wizard/listeners rather than slices/wizard
// this is needed to avoid circular dependencies
import {
  clearSatelliteRegistrationService,
  clearUnsupportedFilesystem,
  clearUnsupportedRegistration,
  clearUnsupportedUsersAndGroups,
  filterImageTypes,
  registerLater,
  resolveOfficialImage,
  syncAwsTarget,
  syncAzureTarget,
  syncGcpTarget,
} from '../slices/wizard/listeners';

export const listenerMiddleware = createListenerMiddleware();

export const startListening =
  listenerMiddleware.startListening as WizardStartListening;

startListening({
  actionCreator: changeArchitecture,
  effect: filterImageTypes,
});

startListening({
  actionCreator: changeDistribution,
  effect: filterImageTypes,
});

startListening({
  actionCreator: changeDistribution,
  effect: registerLater,
});

startListening({
  actionCreator: changeRegistrationType,
  effect: clearSatelliteRegistrationService,
});

startListening({
  actionCreator: changeBlueprintMode,
  effect: clearUnsupportedRegistration,
});

startListening({
  actionCreator: changeBlueprintMode,
  effect: clearUnsupportedFilesystem,
});

startListening({
  actionCreator: changeImageTypes,
  effect: clearUnsupportedUsersAndGroups,
});

startListening({
  actionCreator: changeImageTypes,
  effect: syncAwsTarget,
});

startListening({
  actionCreator: changeImageTypes,
  effect: syncAzureTarget,
});

startListening({
  actionCreator: changeImageTypes,
  effect: syncGcpTarget,
});

startListening({
  actionCreator: changeImageTypes,
  effect: resolveOfficialImage,
});
