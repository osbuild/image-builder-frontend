import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

export const selectWizardMode = (state: RootState) => {
  return state.wizard.details.mode;
};

export const selectBlueprintMode = (state: RootState) => {
  return state.wizard.details.blueprint.mode;
};

export const selectBlueprintId = (state: RootState) => {
  return state.wizard.details.blueprintId;
};

export const selectBlueprintName = (state: RootState) => {
  return state.wizard.details.blueprint.name;
};

export const selectIsCustomName = (state: RootState) => {
  return state.wizard.details.blueprint.isCustomName;
};

export const selectMetadata = (state: RootState) => {
  return state.wizard.details.metadata;
};

export const selectBlueprintDescription = (state: RootState) => {
  return state.wizard.details.blueprint.description;
};

// Derived selector for checking if we're in image mode
export const selectIsImageMode = createSelector(
  [selectBlueprintMode],
  (mode) => mode === 'image',
);
