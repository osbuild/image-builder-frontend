import { useFlag } from '@unleash/proxy-client-react';

import { useGetEnvironment } from './useGetEnvironment';

const useBetaFlag = (flag: string): boolean => {
  const getFlag = useFlag(flag);
  const { isBeta } = useGetEnvironment();
  return isBeta() && getFlag;
};

export default useBetaFlag;
