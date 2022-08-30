import { configureStore } from '@reduxjs/toolkit';
import composes from './reducers/composes';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

export const reducer = {
  composes: composes,
  notifications: notificationsReducer,
};

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(promiseMiddleware);

export const store = configureStore({ reducer, middleware });
