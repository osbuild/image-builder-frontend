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
      if (action.payload.warnings.length > 0) {
        if (action.payload.preserveExisting) {
          const existingWarnings =
            state.warningsContent[action.payload.blueprintId] ?? [];
          const allWarnings = [...existingWarnings];

          action.payload.warnings.forEach((newWarning) => {
            const isDuplicate = allWarnings.some(
              (existing) =>
                existing.name === newWarning.name &&
                existing.description === newWarning.description,
            );
            if (!isDuplicate) {
              allWarnings.push(newWarning);
            }
          });

          state.warningsContent[action.payload.blueprintId] = allWarnings;
        } else {
          state.warningsContent[action.payload.blueprintId] =
            action.payload.warnings;
        }
      } else if (!action.payload.preserveExisting) {
        state.warningsContent[action.payload.blueprintId] = [];
      }
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
