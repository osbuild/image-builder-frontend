import { useFlag } from '@unleash/proxy-client-react';

import { useGetEnvironment } from './useGetEnvironment';

/**
 * @example
 * // returns true
 * toBoolean('true');
 * @example
 * // returns false
 * toBoolean('FALSE');
 * @example
 * // returns false
 * toBoolean(undefined);
 */
const toBoolean = (environmentVariable: string | undefined): boolean => {
  return environmentVariable?.toLowerCase() === 'true';
};

export const useExperimentalFlag = () => {
  const { isBeta } = useGetEnvironment();
  const isExperimental = toBoolean(process.env.EXPERIMENTAL?.toString());
  const flagSuffix = isBeta() ? 'enabled' : 'stable';
  return useFlag(`image-builder.new-wizard.${flagSuffix}`) || isExperimental;
};
