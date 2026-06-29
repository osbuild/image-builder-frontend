import { useDispatch, useSelector, useStore } from 'react-redux';

import type {
  AppDispatch,
  onPremStore,
  RootState,
  serviceStore,
} from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
// Typed useStore for lazily reading state inside event handlers (e.g. click
// callbacks) where useAppSelector would eagerly evaluate on every render.
type AppStore = typeof onPremStore | typeof serviceStore;

export const useAppStore = useStore.withTypes<AppStore>();
