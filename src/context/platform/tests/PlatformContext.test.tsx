import React from 'react';

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlatformProvider, usePlatform } from '@/context/platform';
import type { PlatformHooks } from '@/context/platform/types';

describe('PlatformContext', () => {
  it('throws when usePlatform is called outside PlatformProvider', () => {
    const onError = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener('error', onError);

    expect(() => {
      renderHook(() => usePlatform());
    }).toThrow('usePlatform must be used within a PlatformProvider');

    window.removeEventListener('error', onError);
  });

  it('provides the platform object when wrapped in PlatformProvider', () => {
    const mockPlatform = {
      queries: {},
      mutations: {},
      env: {
        useFlag: () => false,
        useGetEnvironment: () => ({ isBeta: () => false, isProd: () => true }),
      },
      api: {},
    } as unknown as PlatformHooks;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlatformProvider value={mockPlatform}>{children}</PlatformProvider>
    );

    const { result } = renderHook(() => usePlatform(), { wrapper });
    expect(result.current).toBe(mockPlatform);
    expect(result.current.env.useFlag('test')).toBe(false);
  });
});
