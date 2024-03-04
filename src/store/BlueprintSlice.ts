import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from '.';

type blueprintsState = {
  selectedBlueprintId: string | undefined;
  searchInput?: string;
  offset?: number;
  limit?: number;
};

const initialState: blueprintsState = {
  selectedBlueprintId: undefined,
  searchInput: undefined,
  offset: 0,
  limit: 10,
};

export const selectSelectedBlueprintId = (state: RootState) =>
  state.blueprints.selectedBlueprintId;
export const selectBlueprintSearchInput = (state: RootState) =>
  state.blueprints.searchInput;
export const selectOffset = (state: RootState) => state.blueprints.offset;
export const selectLimit = (state: RootState) => state.blueprints.limit;

export const blueprintsSlice = createSlice({
  name: 'blueprints',
  initialState,
  reducers: {
    setBlueprintId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedBlueprintId = action.payload;
    },
    setBlueprintSearchInput: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.searchInput = action.payload;
    },
    setBlueprintsOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    setBlueprintLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
});

export const {
  setBlueprintId,
  setBlueprintSearchInput,
  setBlueprintsOffset,
  setBlueprintLimit,
} = blueprintsSlice.actions;
