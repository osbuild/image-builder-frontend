import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

export const useGetEnvironment = () => {
  const { isBeta, getEnvironment } = useChrome();
  // Expose beta features in the ephemeral environment
  if (isBeta() || getEnvironment() === 'qa') {
    return { isBeta: () => true };
  }
  return { isBeta: () => false };
};
