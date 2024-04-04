import { useDispatch, useSelector } from 'react-redux';

import { useGetOscapCustomizationsQuery } from './imageBuilderApi';
import { selectDistribution, selectProfile } from './wizardSlice';

import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// common hooks
export const useOscapData = () => {
  const release = useAppSelector(selectDistribution);
  const openScapProfile = useAppSelector(selectProfile);
  const { data } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: openScapProfile,
    },
    { skip: !openScapProfile }
  );
  if (!openScapProfile) return undefined;
  return {
    kernel: { append: data?.kernel?.append },
    services: {
      enabled: data?.services?.enabled,
      disabled: data?.services?.disabled,
    },
  };
};

export const useServerStore = () => {
  const oscap = useOscapData();
  return { ...oscap };
};
