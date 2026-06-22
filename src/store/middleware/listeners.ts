import { createListenerMiddleware } from '@reduxjs/toolkit';

import { WizardStartListening } from './types';

import { changeArchitecture, changeDistribution } from '../slices/wizard';
// export from slices/wizard/listeners rather than slices/wizard
// this is needed to avoid circular dependencies
import { filterImageTypes, registerLater } from '../slices/wizard/listeners';

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
