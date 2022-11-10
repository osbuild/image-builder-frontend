import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import clonesSlice from './clonesSlice';
import composesSlice from './composesSlice';
import repositoriesSlice from './repositoriesSlice';

export const reducer = {
  clones: clonesSlice,
  composes: composesSlice,
  notifications: notificationsReducer,
  repositories: repositoriesSlice,
};

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(promiseMiddleware);

export const store = configureStore({ reducer, middleware });
