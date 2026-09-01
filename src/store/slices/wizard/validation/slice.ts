import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    setPendingInput: (state, action: PayloadAction<string>) => {
      if (!state.pendingInputFields.includes(action.payload)) {
        state.pendingInputFields.push(action.payload);
      }
    },
    clearPendingInput: (state, action: PayloadAction<string>) => {
      state.pendingInputFields = state.pendingInputFields.filter(
        (f) => f !== action.payload,
      );
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

export const {
  setForceShowErrors,
  resetForceShowErrors,
  setPendingInput,
  clearPendingInput,
} = validationSlice.actions;
