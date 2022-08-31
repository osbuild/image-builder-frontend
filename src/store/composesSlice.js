import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0,
  allIds: [],
  byId: {},
  error: null,
};

const composesSlice = createSlice({
  name: 'composes',
  initialState,
  reducers: {
    composeAdded: (state, action) => {
      // only add to array if compose does not exist
      if (!state.allIds.includes(action.payload.compose.id)) {
        if (action.payload.insert) {
          state.allIds.unshift(action.payload.compose.id);
        } else {
          state.allIds.push(action.payload.compose.id);
        }
      }
      state.byId[action.payload.compose.id] = action.payload.compose;
      state.error = null;
    },
    composesUpdatedCount: (state, action) => {
      state.count = action.payload.count;
    },
    composeUpdatedStatus: (state, action) => {
      state.byId[action.payload.id].image_status = action.payload.status;
    },
  },
});

export const { composeAdded, composesUpdatedCount, composeUpdatedStatus } =
  composesSlice.actions;
export default composesSlice.reducer;
