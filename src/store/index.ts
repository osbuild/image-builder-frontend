import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import clonesSlice from './clonesSlice';
import composesSlice from './composesSlice';
import { contentSourcesApi } from './contentSourcesApi';
import { edgeApi } from './edgeApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import { provisioningApi } from './provisioningApi';
import { rhsmApi } from './rhsmApi';

export const reducer = {
  clones: clonesSlice,
  composes: composesSlice,
  [contentSourcesApi.reducerPath]: contentSourcesApi.reducer,
  [edgeApi.reducerPath]: edgeApi.reducer,
  [imageBuilderApi.reducerPath]: imageBuilderApi.reducer,
  [rhsmApi.reducerPath]: rhsmApi.reducer,
  [provisioningApi.reducerPath]: provisioningApi.reducer,
  notifications: notificationsReducer,
};

export const middleware = (getDefaultMiddleware: Function) =>
  getDefaultMiddleware().concat(
    promiseMiddleware,
    contentSourcesApi.middleware,
    imageBuilderApi.middleware,
    rhsmApi.middleware,
    provisioningApi.middleware
  );

export const store = configureStore({ reducer, middleware });
