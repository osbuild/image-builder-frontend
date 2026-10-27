import { useEffect, useRef } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '@/constants';
import { RecommendationsResponse } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  IBPackage,
  selectDistribution,
  selectPackages,
} from '@/store/slices/wizard';

export const useSearchAnalytics = (
  isOpen: boolean,
  packageType: 'packages' | 'groups',
  transformedRecommendations: IBPackage[],
  recommendationsData: RecommendationsResponse | undefined,
) => {
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const packages = useAppSelector(selectPackages);
  const distribution = useAppSelector(selectDistribution);

  const hasTrackedOpen = useRef(false);
  const hasTrackedRecommendations = useRef(false);

  useEffect(() => {
    if (!isOpen || packageType !== 'packages' || isOnPremise) {
      if (!isOpen) {
        hasTrackedOpen.current = false;
        hasTrackedRecommendations.current = false;
      }
      return;
    }

    if (!hasTrackedOpen.current) {
      analytics.track(
        `${AMPLITUDE_MODULE_NAME} - Package Search Dropdown Opened`,
        {
          module: AMPLITUDE_MODULE_NAME,
          isPreview: isBeta(),
          selectedPackages: packages.map((pkg) => pkg.name),
          recommendationsShown: transformedRecommendations.length > 0,
        },
      );
      hasTrackedOpen.current = true;
    }

    if (
      transformedRecommendations.length > 0 &&
      !hasTrackedRecommendations.current
    ) {
      analytics.track(
        `${AMPLITUDE_MODULE_NAME} - Package Recommendations Shown`,
        {
          module: AMPLITUDE_MODULE_NAME,
          isPreview: isBeta(),
          shownRecommendations: recommendationsData?.packages || [],
          selectedPackages: packages.map((pkg) => pkg.name),
          distribution: distribution.replace('-', ''),
          modelVersion: recommendationsData?.modelVersion,
        },
      );
      hasTrackedRecommendations.current = true;
    }
    // analytics and isBeta are unstable dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    transformedRecommendations,
    isOnPremise,
    packageType,
    packages,
    distribution,
    recommendationsData,
  ]);
};
