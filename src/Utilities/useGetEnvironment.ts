import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useFlag as useUnleashFlag } from '@unleash/proxy-client-react';

import { selectIsOnPremise } from '../store/envSlice';
import { useAppSelector } from '../store/hooks';

export const useGetEnvironment = process.env.IS_ON_PREMISE
  ? () => ({ isBeta: () => false, isProd: () => true })
  : () => {
      const { isBeta, isProd, getEnvironment } = useChrome();
      // Expose beta features in the ephemeral environment
      if (isBeta() || getEnvironment() === 'qa') {
        return { isBeta: () => true, isProd: isProd };
      }
      return { isBeta: () => false, isProd: isProd };
    };

/**
 * A hook that returns the value of a flag with a default value for ephemeral environment.
 * @param flag The flag to check.
 * @param ephemDefault The default value of the flag in ephemeral environment, defaults to true.
 * @returns The value of the flag if the environment is not ephemeral, the selected default otherwise.
 * @example
 *   const isFlagEnabled = useFlagWithEphemDefault('image-builder.my-flag');
 */
export const useFlagWithEphemDefault = (
  flag: string,
  ephemDefault: boolean = true,
): boolean => {
  const getFlag = useFlag(flag);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const { getEnvironment } = useChrome();
  if (isOnPremise) {
    return false;
  }
  return (getEnvironment() === 'qa' && ephemDefault) || getFlag;
};

const onPremFlag = (flag: string): boolean => {
  switch (flag) {
    case 'image-builder.net-installer':
      return true;
    case 'image-builder.pxe-tar-xz.enabled':
      return true;
    default:
      return false;
  }
};

// Since some of these flags are only relevant to
// the service, we need a way of bypassing this for on-prem
export const useFlag = !process.env.IS_ON_PREMISE ? useUnleashFlag : onPremFlag;
