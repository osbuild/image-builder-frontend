import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

export const selectIsOnPremise = (state: RootState) => {
  return state.env.isOnPremise;
};

export const selectPathResolver = createSelector(
  [selectIsOnPremise],
  (isOnPremise) =>
    (path = ''): string => {
      if (isOnPremise) {
        return path.length > 0 ? path : '/';
      }
      return `/insights/image-builder${path.length > 0 ? `/${path}` : ''}`;
    },
);
