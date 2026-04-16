import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

// Basic selectors
export const selectSelectedBlueprintId = (state: RootState) =>
  state.blueprints.selectedBlueprintId;
export const selectBlueprintSearchInput = (state: RootState) =>
  state.blueprints.searchInput;
export const selectOffset = (state: RootState) => state.blueprints.offset;
export const selectLimit = (state: RootState) => state.blueprints.limit;
export const selectBlueprintVersionFilter = (state: RootState) =>
  state.blueprints.versionFilter;

// Derived selectors
// We allow only 'latest' filtering, everything else is understood as 'all'
export const selectBlueprintVersionFilterAPI = createSelector(
  [selectBlueprintVersionFilter],
  (versionFilter): number | undefined => {
    if (versionFilter === 'latest') return -1;
    return undefined;
  },
);
