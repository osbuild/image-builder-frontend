// listenerMiddleware.ts
// https://redux-toolkit.js.org/api/createListenerMiddleware#typescript-usage
import {
  createListenerMiddleware,
  addListener,
  type TypedStartListening,
  type TypedAddListener
} from '@reduxjs/toolkit';

import type { RootState, AppDispatch } from './index';

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

export const addAppListener = addListener as TypedAddListener<
  RootState,
  AppDispatch
>;
