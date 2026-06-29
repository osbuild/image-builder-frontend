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

type AppStore = typeof onPremStore | typeof serviceStore;
// Typed useStore for lazily reading state inside event handlers,
// because we don't want to get the store state as the component renders
export const useAppStore = useStore.withTypes<AppStore>();
