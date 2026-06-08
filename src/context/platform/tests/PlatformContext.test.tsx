import React from 'react';

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlatformProvider, usePlatform } from '@/context/platform';

import { mockPlatform } from './mocks';

describe('PlatformContext', () => {
  it('throws when usePlatform is called outside PlatformProvider', () => {
    // React logs to console.error before the error propagates;
    // suppress it so the global setup spy doesn't treat it as a failure.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => usePlatform());
    }).toThrow('usePlatform must be used within a PlatformProvider');

    spy.mockRestore();
  });

  it('provides the platform object when wrapped in PlatformProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlatformProvider value={mockPlatform}>{children}</PlatformProvider>
    );

    const { result } = renderHook(() => usePlatform(), { wrapper });
    expect(result.current).toBe(mockPlatform);
    expect(result.current.env.useFlag('test')).toBe(false);
  });
});
