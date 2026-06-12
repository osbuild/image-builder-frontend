import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useFlag as useUnleashFlag } from '@unleash/proxy-client-react';

export const useGetEnvironment = () => {
  const { isBeta, isProd, getEnvironment } = useChrome();
  if (isBeta() || getEnvironment() === 'qa') {
    return { isBeta: () => true, isProd: isProd };
  }
  return { isBeta: () => false, isProd: isProd };
};

export const useFlag = useUnleashFlag;

export const useFlagWithEphemDefault = (
  flag: string,
  ephemDefault: boolean = true,
): boolean => {
  const getFlag = useFlag(flag);
  const { getEnvironment } = useChrome();
  return (getEnvironment() === 'qa' && ephemDefault) || getFlag;
};
