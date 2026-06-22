import {
  ListenerEffect,
  TypedStartListening,
  UnknownAction,
} from '@reduxjs/toolkit';

import { AppDispatch, RootState } from '@/store';

export type WizardStartListening = TypedStartListening<RootState, AppDispatch>;

export type WizardListenerEffect<Action extends UnknownAction = UnknownAction> =
  ListenerEffect<Action, RootState, AppDispatch>;
