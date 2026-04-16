import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { BlueprintsState, VersionFilterType } from './types';

const initialState: BlueprintsState = {
  selectedBlueprintId: undefined,
  searchInput: undefined,
  offset: 0,
  limit: 10,
  versionFilter: 'all',
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
      action: PayloadAction<VersionFilterType>,
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
