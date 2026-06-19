import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialState } from './state';
import { BlueprintModeOptions } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const detailsSlice = createSlice({
  name: 'wizard/details',
  initialState,
  reducers: {
    changeBlueprintMode: (
      state,
      action: PayloadAction<BlueprintModeOptions>,
    ) => {
      state.blueprint.mode = action.payload;
    },
    changeBlueprintName: (state, action: PayloadAction<string>) => {
      state.blueprint.name = action.payload;
    },
    setIsCustomName: (state) => {
      state.blueprint.isCustomName = true;
    },
    changeBlueprintDescription: (state, action: PayloadAction<string>) => {
      state.blueprint.description = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `details` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).details ??
          initialState,
      );
  },
});

export const {
  changeBlueprintMode,
  changeBlueprintName,
  setIsCustomName,
  changeBlueprintDescription,
} = detailsSlice.actions;
