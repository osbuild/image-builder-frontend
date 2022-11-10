import { createSlice } from '@reduxjs/toolkit';

import api from '../api';

const initialState = {
  count: 0,
  allIds: [],
  byId: {},
  error: null,
};

export const fetchRepositories = () => async (dispatch) => {
  let { data, meta } = await api.getRepositories();
  if (data.length < meta.count) {
    ({ data } = await api.getRepositories(meta.count));
  }
  dispatch(repositoriesAdded({ repositories: data }));
  dispatch(repositoriesUpdatedCount({ count: data.length }));
};

export const repositoriesSlice = createSlice({
  name: 'repositories',
  initialState,
  reducers: {
    repositoriesAdded: (state, action) => {
      action.payload.repositories.map((repo) => {
        // The repo url is used as the id
        if (!state.allIds.includes(repo.url)) {
          state.allIds.push(repo.url);
        }
        state.byId[repo.url] = repo;
      });
    },
    repositoriesUpdatedCount: (state, action) => {
      state.count = action.payload.count;
    },
  },
});

export const selectRepositoryById = (state, repoId) =>
  state.repositories.byId[repoId];

export const selectValidRepositoryIds = (state) => {
  const validRepositoryIds = [];
  for (const repoId of state.repositories.allIds) {
    if (state.repositories.byId[repoId].status === 'Valid') {
      validRepositoryIds.push(repoId);
    }
  }
  return validRepositoryIds;
};

export const selectValidRepositories = (state) => {
  const validRepositories = {};
  for (const repoId of state.repositories.allIds) {
    if (state.repositories.byId[repoId].status === 'Valid') {
      validRepositories[repoId] = state.repositories.byId[repoId];
    }
  }
  return validRepositories;
};

export const { repositoriesAdded, repositoriesUpdatedCount } =
  repositoriesSlice.actions;
export default repositoriesSlice.reducer;
