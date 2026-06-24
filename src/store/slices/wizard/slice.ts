import { Reducer } from '@reduxjs/toolkit';

import { cloudProvidersSlice, cloudProvidersState } from './cloud';
import { complianceSlice, complianceState } from './compliance';
import { contentSlice, contentState } from './content';
import { detailsSlice, detailsState } from './details';
import { filesystemSlice, filesystemState } from './filesystem';
import { outputSlice, outputState } from './output';
import { registrationSlice, registrationState } from './registration';
import { systemSlice, systemState } from './system';
import { WizardState } from './types';

// we can't use RTK query's `combineSlices` helper yet, we
// first need to convert all the items into submodules and
// then we can compose the slice using the `combineSlices`.
// The reason for this is that there is no way to nest the
// child slice under the parent slice yet, we would need
// to temporarily change the slice shape, which is not ideal
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

export const wizardReducer: Reducer<WizardState> = (state, action) => {
  return {
    cloudProviders: cloudProvidersSlice.reducer(state?.cloudProviders, action),
    compliance: complianceSlice.reducer(state?.compliance, action),
    content: contentSlice.reducer(state?.content, action),
    details: detailsSlice.reducer(state?.details, action),
    filesystem: filesystemSlice.reducer(state?.filesystem, action),
    output: outputSlice.reducer(state?.output, action),
    registration: registrationSlice.reducer(state?.registration, action),
    system: systemSlice.reducer(state?.system, action),
  };
};
