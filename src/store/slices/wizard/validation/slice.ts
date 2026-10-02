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
    addPendingInput: (state, action: PayloadAction<string>) => {
      if (!state.pendingInputs.includes(action.payload)) {
        state.pendingInputs.push(action.payload);
      }
    },
    removePendingInput: (state, action: PayloadAction<string>) => {
      const index = state.pendingInputs.indexOf(action.payload);
      if (index !== -1) {
        state.pendingInputs.splice(index, 1);
      }
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
  addPendingInput,
  removePendingInput,
} = validationSlice.actions;
