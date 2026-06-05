import { createContext, useContext } from 'react';

import type { PlatformHooks } from './types';

const PlatformContext = createContext<PlatformHooks | null>(null);
PlatformContext.displayName = 'PlatformContext';

export const usePlatform = (): PlatformHooks => {
  const ctx = useContext(PlatformContext);
  if (ctx === null) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return ctx;
};

export const PlatformProvider = PlatformContext.Provider;
