import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ON_PREM_RELEASES, RELEASES } from '@/constants';
import { usePlatformFeatures } from '@/Hooks/usePlatformFeatures';
import { useAppSelector } from '@/store/hooks';

vi.mock('@/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('usePlatformFeatures', () => {
  it('returns hosted features when not on-premise', () => {
    vi.mocked(useAppSelector).mockReturnValue(false);
    const { result } = renderHook(() => usePlatformFeatures());
    expect(result.current.releases).toBe(RELEASES);
    expect(result.current.showReleaseLifecycleInfo).toBe(true);
    expect(result.current.showDevelopmentReleases).toBe(true);
    expect(result.current.canCrossArchBuild).toBe(true);
    expect(result.current.canSelectRelease).toBe(true);
    expect(result.current.restoresPreviousSelections).toBe(true);
    expect(result.current.setsDefaultImageSource).toBe(true);
    expect(result.current.showComposeVersion).toBe(true);
    expect(result.current.showBlueprintOutOfSyncAlert).toBe(true);
    expect(result.current.exportFormat).toBe('json');
    expect(result.current.exportMime).toBe('application/json');
    expect(result.current.securitySectionLabel).toBe(
      'Compliance configuration',
    );
  });

  it('returns on-prem features when on-premise', () => {
    vi.mocked(useAppSelector).mockReturnValue(true);
    const { result } = renderHook(() => usePlatformFeatures());
    expect(result.current.releases).toBe(ON_PREM_RELEASES);
    expect(result.current.showReleaseLifecycleInfo).toBe(false);
    expect(result.current.showDevelopmentReleases).toBe(false);
    expect(result.current.canCrossArchBuild).toBe(false);
    expect(result.current.canSelectRelease).toBe(false);
    expect(result.current.restoresPreviousSelections).toBe(false);
    expect(result.current.setsDefaultImageSource).toBe(false);
    expect(result.current.showComposeVersion).toBe(false);
    expect(result.current.showBlueprintOutOfSyncAlert).toBe(false);
    expect(result.current.exportFormat).toBe('toml');
    expect(result.current.exportMime).toBe('application/octet-stream');
    expect(result.current.securitySectionLabel).toBe('Security configuration');
  });
});
