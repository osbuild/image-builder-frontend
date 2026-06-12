import { ON_PREM_RELEASES, RELEASES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';

const hostedFeatures = {
  releases: RELEASES,
  showReleaseLifecycleInfo: true,
  showDevelopmentReleases: true,
  canCrossArchBuild: true,
  canSelectRelease: true,
  restoresPreviousSelections: true,
  setsDefaultImageSource: true,
  showComposeVersion: true,
  showBlueprintOutOfSyncAlert: true,
  exportFormat: 'json' as const,
  exportMime: 'application/json',
  securitySectionLabel: 'Compliance configuration',
} as const;

const onPremFeatures = {
  releases: ON_PREM_RELEASES,
  showReleaseLifecycleInfo: false,
  showDevelopmentReleases: false,
  canCrossArchBuild: false,
  canSelectRelease: false,
  restoresPreviousSelections: false,
  setsDefaultImageSource: false,
  showComposeVersion: false,
  showBlueprintOutOfSyncAlert: false,
  exportFormat: 'toml' as const,
  exportMime: 'application/octet-stream',
  securitySectionLabel: 'Security configuration',
} as const;

export type PlatformFeatures = typeof hostedFeatures | typeof onPremFeatures;

export const usePlatformFeatures = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  return isOnPremise ? onPremFeatures : hostedFeatures;
};
