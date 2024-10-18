import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useFlag as useUnleashFlag } from '@unleash/proxy-client-react';

export const useGetEnvironment = () => {
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
export const useFlagWithEphemDefault = !process.env.IS_ON_PREMISE
  ? (flag: string, ephemDefault: boolean = true): boolean => {
      const getFlag = useUnleashFlag(flag);
      const { getEnvironment } = useChrome();
      return (getEnvironment() === 'qa' && ephemDefault) || getFlag;
    }
  : () => false;

// Since some of these flags are only relevant to
// the service, we need a way of bypassing this for on-prem
export const useFlag = !process.env.IS_ON_PREMISE
  ? useUnleashFlag
  : () => false;
