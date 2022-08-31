import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import composesSlice from './composesSlice';

export const reducer = {
  composes: composesSlice,
  notifications: notificationsReducer,
};

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(promiseMiddleware);

export const store = configureStore({ reducer, middleware });
