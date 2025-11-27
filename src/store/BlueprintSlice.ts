import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BlueprintLintItem } from './imageBuilderApi';

import type { RootState } from '.';

export type versionFilterType = 'latest' | 'all';

type blueprintsState = {
  selectedBlueprintId: string | undefined;
  searchInput?: string | undefined;
  offset?: number;
  limit?: number;
  versionFilter?: versionFilterType;
  warningsContent: Record<string, BlueprintLintItem[]>;
};

const initialState: blueprintsState = {
  selectedBlueprintId: undefined,
  searchInput: undefined,
  offset: 0,
  limit: 10,
  versionFilter: 'all',
  warningsContent: {},
};

export const selectSelectedBlueprintId = (state: RootState) =>
  state.blueprints.selectedBlueprintId;
export const selectBlueprintSearchInput = (state: RootState) =>
  state.blueprints.searchInput;
export const selectOffset = (state: RootState) => state.blueprints.offset;
export const selectLimit = (state: RootState) => state.blueprints.limit;
export const selectBlueprintVersionFilter = (state: RootState) =>
  state.blueprints.versionFilter;
export const selectBlueprintVersionFilterAPI = (
  state: RootState,
): number | undefined => {
  const blueprintVersionFilter = state.blueprints.versionFilter;
  // We allow only 'latest' filtering, everything else is understood as 'all'
  if (blueprintVersionFilter === 'latest') {
    return -1;
  }
  return undefined;
};

export const selectWarningsContent = (
  state: RootState,
  blueprintId: string,
): BlueprintLintItem[] => state.blueprints.warningsContent[blueprintId] ?? [];

export const selectWarningsContentForSelectedBlueprint = (
  state: RootState,
): BlueprintLintItem[] => {
  const blueprintId = state.blueprints.selectedBlueprintId;
  return blueprintId ? selectWarningsContent(state, blueprintId) : [];
};

export const blueprintsSlice = createSlice({
  name: 'blueprints',
  initialState,
  reducers: {
    setBlueprintId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedBlueprintId = action.payload;
    },
    setBlueprintSearchInput: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      state.searchInput = action.payload;
    },
    setBlueprintsOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    setBlueprintLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setBlueprintVersionFilter: (
      state,
      action: PayloadAction<versionFilterType>,
    ) => {
      state.versionFilter = action.payload;
    },
    setWarningsContent: (
      state,
      action: PayloadAction<{
        blueprintId: string;
        warnings: BlueprintLintItem[];
        preserveExisting?: boolean;
      }>,
    ) => {
      const { blueprintId, warnings, preserveExisting } = action.payload;

      // Case 1: No warnings, and we should NOT preserve → reset to empty
      if (warnings.length === 0 && !preserveExisting) {
        state.warningsContent[blueprintId] = [];
        return;
      }

      // Case 2: No warnings, but we SHOULD preserve → do nothing
      if (warnings.length === 0 && preserveExisting) {
        return;
      }

      // Case 3: We have warnings, and preserveExisting = false → override
      if (!preserveExisting) {
        state.warningsContent[blueprintId] = warnings;
        return;
      }

      // Case 4: We have warnings, and preserveExisting = true → merge
      const existing = state.warningsContent[blueprintId] ?? [];
      const merged = [...existing];

      warnings.forEach((newWarning) => {
        const isDuplicate = merged.some(
          (existingWarning) =>
            existingWarning.name === newWarning.name &&
            existingWarning.description === newWarning.description,
        );
        if (!isDuplicate) {
          merged.push(newWarning);
        }
      });

      state.warningsContent[blueprintId] = merged;
    },
  },
});

export const {
  setBlueprintId,
  setBlueprintSearchInput,
  setBlueprintsOffset,
  setBlueprintLimit,
  setBlueprintVersionFilter,
  setWarningsContent,
} = blueprintsSlice.actions;
