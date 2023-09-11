import { createSelector, createSlice } from '@reduxjs/toolkit';

import { selectCloneById } from './clonesSlice';

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

      // initialize empty clones array
      if (!state.byId[action.payload.compose.id].clones) {
        state.byId[action.payload.compose.id].clones = [];
      }

      state.error = null;
    },
    composesUpdatedCount: (state, action) => {
      state.count = action.payload.count;
    },
    composeUpdatedStatus: (state, action) => {
      state.byId[action.payload.id].image_status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('clones/cloneAdded', (state, action) => {
      state.byId[action.payload.parent].clones.push(action.payload.clone.id);
    });
  },
});

export const selectComposeById = (state, composeId) => {
  const compose = state.composes.byId[composeId];

  if (compose !== undefined) {
    return {
      created_at: compose.created_at,
      id: compose.id,
      imageName: compose.image_name || compose.id,
      imageDescription: compose.image_description || '',
      region: compose.image_status?.upload_status?.options?.region,
      ami: compose.image_status?.upload_status?.options?.ami,
      share_with_accounts:
        compose.request.image_requests[0].upload_request?.options
          .share_with_accounts,
      share_with_sources:
        compose.request.image_requests[0].upload_request?.options
          .share_with_sources,
      status: compose.image_status?.status,
      clones: [...compose.clones],
      imageType: compose.request.image_requests[0].image_type,
      uploadType: compose.request.image_requests[0].upload_request.type,
      uploadOptions: compose.request.image_requests[0].upload_request.options,
      uploadStatus: compose.image_status?.upload_status,
      request: compose.request,
      architecture: compose.request.image_requests[0].architecture,
      isClone: false,
    };
  } else {
    return null;
  }
};

export const selectEdgeComposesByImageType = (state, composeId) => {
  // eslint-disable-next-line no-console
  console.log('vomposeID', state.composes.byId[composeId].request);
  const composesType =
    state.composes.byId[composeId].request.image_requests[0].image_type;
  // eslint-disable-next-line no-debugger
  debugger;
  // eslint-disable-next-line no-console
  console.log('composesType', composesType);
  if (
    composesType !== 'rhel-edge-commit' &&
    composesType !== 'rhel-edge-installer'
  ) {
    return composesType;
  }
};

export const selectClonesById = (state, composeId) => {
  const compose = state.composes.byId[composeId];

  if (compose && compose.clones.length !== 0) {
    const clones = compose.clones.map((cloneId) => {
      const clone = state.clones.byId[cloneId];
      return {
        created_at: clone.created_at,
        id: clone.id,
        region: clone.request.region,
        ami: clone.image_status?.upload_status?.options?.ami,
        share_with_accounts: clone.request.share_with_accounts,
        share_with_sources: clone.request.share_with_sources,
        status: clone.image_status?.status,
      };
    });
    return clones;
  }

  return [];
};

export const selectImageById = (state, imageId) => {
  const image = state.composes.allIds.includes(imageId)
    ? selectComposeById(state, imageId)
    : selectCloneById(state, imageId);

  return image;
};

export const selectImagesById = createSelector(
  [selectComposeById, selectClonesById],
  (compose, clones) => [compose, ...clones]
);

export const selectImageStatusesById = createSelector(
  [selectImagesById],
  (images) => {
    return images.map((image) => (image !== null ? image.status : null));
  }
);

export const { composeAdded, composesUpdatedCount, composeUpdatedStatus } =
  composesSlice.actions;
export default composesSlice.reducer;
