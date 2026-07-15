import { createSlice } from '@reduxjs/toolkit';

import { initialState } from './state';

import { initializeWizard, loadWizardState } from '../actions';

export const validationSlice = createSlice({
  name: 'wizard/validation',
  initialState,
  reducers: {
    setForceShowErrors: (state) => {
      state.forceShowErrors = true;
    },
    resetForceShowErrors: (state) => {
      state.forceShowErrors = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).validation ??
          initialState,
      );
  },
});

export const { setForceShowErrors, resetForceShowErrors } =
  validationSlice.actions;
