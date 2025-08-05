import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '.';

export type versionFilterType = 'latest' | 'all';

type blueprintsState = {
  selectedBlueprintId: string | undefined;
  searchInput?: string | undefined;
  offset?: number;
  limit?: number;
  versionFilter?: versionFilterType;
};

const initialState: blueprintsState = {
  selectedBlueprintId: undefined,
  searchInput: undefined,
  offset: 0,
  limit: 10,
  versionFilter: 'all',
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
  },
});

export const {
  setBlueprintId,
  setBlueprintSearchInput,
  setBlueprintsOffset,
  setBlueprintLimit,
  setBlueprintVersionFilter,
} = blueprintsSlice.actions;
