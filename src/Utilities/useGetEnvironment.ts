import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useFlag as useUnleashFlag } from '@unleash/proxy-client-react';

export const useGetEnvironment = process.env.IS_ON_PREMISE
  ? () => ({ isBeta: () => false, isProd: () => true, isFedoraEnv: false })
  : () => {
      const { isBeta, isProd, getEnvironment, getEnvironmentDetails } =
        useChrome();
      // Expose beta features in the ephemeral environment
      const isFedoraEnv: boolean =
        getEnvironmentDetails()?.url.some((x: string) =>
          x.includes('fedora')
        ) ?? false;
      if (isBeta() || getEnvironment() === 'qa') {
        return { isBeta: () => true, isProd: isProd, isFedoraEnv };
      }
      return { isBeta: () => false, isProd: isProd, isFedoraEnv };
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
  ephemDefault: boolean = true
): boolean => {
  const getFlag = useFlag(flag);
  const { getEnvironment } = useChrome();
  if (process.env.IS_ON_PREMISE) {
    return false;
  }
  return (getEnvironment() === 'qa' && ephemDefault) || getFlag;
};

const onPremFlag = (flag: string): boolean => {
  switch (flag) {
    case 'image-builder.users.enabled':
    case 'image-builder.hostname.enabled':
    case 'image-builder.kernel.enabled':
    case 'image-builder.firewall.enabled':
    case 'image-builder.services.enabled':
    case 'image-builder.templates.enabled':
      return true;
    default:
      return false;
  }
};

// Since some of these flags are only relevant to
// the service, we need a way of bypassing this for on-prem
export const useFlag = (flag: string) => {
  const { isFedoraEnv } = useGetEnvironment();

  const onPremFlagValue = onPremFlag(flag);
  const unleashFlagValue = useUnleashFlag(flag);
  const shouldUseOnPrem = process.env.IS_ON_PREMISE || isFedoraEnv;

  return shouldUseOnPrem ? onPremFlagValue : unleashFlagValue;
};
