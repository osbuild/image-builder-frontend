import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import { apiSlice } from './apiSlice';
import clonesSlice from './clonesSlice';
import composesSlice from './composesSlice';
import { imageBuilderApi } from './imageBuilderApi';

export const reducer = {
  [apiSlice.reducerPath]: apiSlice.reducer,
  clones: clonesSlice,
  composes: composesSlice,
  [imageBuilderApi.reducerPath]: imageBuilderApi.reducer,
  notifications: notificationsReducer,
};

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(promiseMiddleware)
    .concat(apiSlice.middleware)
    .concat(imageBuilderApi.middleware);

export const store = configureStore({ reducer, middleware });
