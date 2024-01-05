import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Distributions } from './imageBuilderApi';

import { RHEL_9 } from '../constants';

import { RootState } from '.';

type wizardState = {
  distribution: Distributions;
};

const initialState: wizardState = {
  distribution: RHEL_9,
};

export const selectDistribution = (state: RootState) => {
  return state.wizard.distribution;
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.distribution = action.payload;
    },
  },
});

export const { initializeWizard, changeDistribution } = wizardSlice.actions;
export default wizardSlice.reducer;
