import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Distributions, ImageRequest } from './imageBuilderApi';

import { RHEL_9, X86_64 } from '../constants';

import { RootState } from '.';

type wizardState = {
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
};

const initialState: wizardState = {
  architecture: X86_64,
  distribution: RHEL_9,
};

export const selectArchitecture = (state: RootState) => {
  return state.wizard.architecture;
};

export const selectDistribution = (state: RootState) => {
  return state.wizard.distribution;
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>
    ) => {
      state.architecture = action.payload;
    },
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.distribution = action.payload;
    },
  },
});

export const { initializeWizard, changeArchitecture, changeDistribution } =
  wizardSlice.actions;
export default wizardSlice.reducer;
