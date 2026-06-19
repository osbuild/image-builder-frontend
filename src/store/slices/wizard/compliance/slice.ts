import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialState } from './state';
import { ComplianceSlice, ComplianceType } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const complianceSlice = createSlice({
  name: 'wizard/compliance',
  initialState,
  reducers: {
    changeComplianceType: (state, action: PayloadAction<ComplianceType>) => {
      state.type = action.payload;
    },
    setCompliancePolicy: (
      state,
      action: PayloadAction<Pick<ComplianceSlice, 'policyID' | 'policyTitle'>>,
    ) => {
      state.policyID = action.payload.policyID;
      state.policyTitle = action.payload.policyTitle;
    },
    setOscapProfile: (state, action: PayloadAction<string | undefined>) => {
      state.profileID = action.payload;
    },
    changeFips: (state, action: PayloadAction<boolean>) => {
      state.fips.enabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `compliance` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).compliance ??
          initialState,
      );
  },
});

export const {
  setCompliancePolicy,
  setOscapProfile,
  changeComplianceType,
  changeFips,
} = complianceSlice.actions;
