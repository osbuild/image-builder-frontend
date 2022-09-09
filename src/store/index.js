import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import composes from './reducers/composes';

export const reducer = {
  composes: composes,
  notifications: notificationsReducer,
};

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(promiseMiddleware);

export const store = configureStore({ reducer, middleware });
