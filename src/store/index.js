import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import clonesSlice from './clonesSlice';
import composesSlice from './composesSlice';
import { contentSourcesApi } from './contentSourcesApi';
import { imageBuilderApi } from './imageBuilderApi';
import { provisioningApi } from './provisioningApi';
import { rhsmApi } from './rhsmApi';

export const reducer = {
  clones: clonesSlice,
  composes: composesSlice,
  [contentSourcesApi.reducerPath]: contentSourcesApi.reducer,
  [imageBuilderApi.reducerPath]: imageBuilderApi.reducer,
  [rhsmApi.reducerPath]: rhsmApi.reducer,
  [provisioningApi.reducerPath]: provisioningApi.reducer,
  notifications: notificationsReducer,
};

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(promiseMiddleware)
    .concat(contentSourcesApi.middleware)
    .concat(imageBuilderApi.middleware)
    .concat(rhsmApi.middleware)
    .concat(provisioningApi.middleware);

export const store = configureStore({ reducer, middleware });
