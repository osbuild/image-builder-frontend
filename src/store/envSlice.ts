import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '.';

const initialState = {
  isOnPremise:
    // Casting here is actually okay because the values from
    // webpack will only ever be 'true', true or undefined
    // and never 'false' (which evaluates to true when cast)
    Boolean(process.env.IS_ON_PREMISE),
};

export const selectIsOnPremise = (state: RootState) => {
  return state.env.isOnPremise;
};

// NOTE: env might get confusing since there is an
// env object already inside the wizardSlice, but this
// feels like the most natural name for this
export const envSlice = createSlice({
  name: 'env',
  initialState,
  reducers: {},
});
