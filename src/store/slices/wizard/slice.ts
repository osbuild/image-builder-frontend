import { combineSlices } from '@reduxjs/toolkit';

import { cloudProvidersSlice, cloudProvidersState } from './cloud';
import { complianceSlice, complianceState } from './compliance';
import { contentSlice, contentState } from './content';
import { detailsSlice, detailsState } from './details';
import { filesystemSlice, filesystemState } from './filesystem';
import { outputSlice, outputState } from './output';
import { registrationSlice, registrationState } from './registration';
import { systemSlice, systemState } from './system';

export const wizardReducer = combineSlices({
  cloudProviders: cloudProvidersSlice.reducer,
  compliance: complianceSlice.reducer,
  content: contentSlice.reducer,
  details: detailsSlice.reducer,
  filesystem: filesystemSlice.reducer,
  output: outputSlice.reducer,
  registration: registrationSlice.reducer,
  system: systemSlice.reducer,
});

export type WizardState = ReturnType<typeof wizardReducer>;

export const initialState: WizardState = {
  cloudProviders: cloudProvidersState,
  compliance: complianceState,
  content: contentState,
  details: detailsState,
  filesystem: filesystemState,
  output: outputState,
  registration: registrationState,
  system: systemState,
};
