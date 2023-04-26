import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

export const useGetEnvironment = () => {
  const { isBeta, isProd, getEnvironment } = useChrome();
  // Expose beta features in the ephemeral environment
  if (isBeta() || getEnvironment() === 'qa') {
    return { isBeta: () => true, isProd: isProd };
  }
  return { isBeta: () => false, isProd: isProd };
};
