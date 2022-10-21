import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allIds: [],
  byId: {},
  error: null,
};

export const clonesSlice = createSlice({
  name: 'clones',
  initialState,
  reducers: {
    cloneAdded: (state, action) => {
      if (!state.allIds.includes(action.payload.clone.id)) {
        state.allIds.push(action.payload.clone.id);
      }
      state.byId[action.payload.clone.id] = { ...action.payload.clone };
      state.byId[action.payload.clone.id].parent = action.payload.parent;
      state.error = null;
    },
    cloneUpdatedStatus: (state, action) => {
      const image_status = {
        status: action.payload.status.status,
        upload_status: action.payload.status,
      };
      state.byId[action.payload.id].image_status = image_status;
    },
  },
});

export const selectCloneById = (state, cloneId) => {
  const clone = state.clones.byId[cloneId];

  if (clone !== undefined) {
    return {
      created_at: clone.created_at,
      id: clone.id,
      region: clone.request.region,
      ami: clone.image_status?.upload_status?.options?.ami,
      share_with_accounts: clone.request.share_with_accounts,
      status: clone.image_status?.status,
      uploadStatus: clone.image_status?.upload_status,
      parent: clone.parent,
      imageType: 'ami',
      isClone: true,
    };
  } else {
    return null;
  }
};

export const { cloneAdded, cloneUpdatedStatus } = clonesSlice.actions;
export default clonesSlice.reducer;
