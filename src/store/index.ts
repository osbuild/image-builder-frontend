import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import { contentSourcesApi } from './contentSourcesApi';
import { edgeApi } from './edgeApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import { provisioningApi } from './provisioningApi';
import { rhsmApi } from './rhsmApi';

export const reducer = {
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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
