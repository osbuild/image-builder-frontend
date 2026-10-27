import { useEffect, useMemo } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { excludeEUSReposFilter } from '@/Components/CreateImageWizard/steps/Repositories/repositoriesUtilities';
import { AMPLITUDE_MODULE_NAME, ContentOrigin } from '@/constants';
import { useRecommendPackageMutation } from '@/store/api/backend';
import {
  useListRepositoriesQuery,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  IBPackage,
  selectArchitecture,
  selectDistribution,
  selectPackages,
} from '@/store/slices/wizard';
import { releaseToVersion } from '@/Utilities/releaseToVersion';

export const usePackageRecommendations = (
  packageType: 'packages' | 'groups',
) => {
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const packages = useAppSelector(selectPackages);

  const version = releaseToVersion(distribution);

  const { data: distroRepos, isSuccess: isSuccessDistroRepos } =
    useListRepositoriesQuery({
      availableForArch: arch,
      availableForVersion: version,
      ...excludeEUSReposFilter,
      contentType: 'rpm',
      origin: ContentOrigin.REDHAT,
      limit: 100,
      offset: 0,
    });

  const [
    fetchRecommendedPackages,
    {
      data: recommendationsData,
      isLoading: isLoadingRecommendations,
      isError: isErrorRecommendations,
      reset: resetRecommendations,
    },
  ] = useRecommendPackageMutation();

  const [
    fetchRecommendationDescriptions,
    { data: dataDescriptions, isSuccess: isSuccessDescriptions },
  ] = useSearchRpmMutation();

  useEffect(() => {
    resetRecommendations();

    if (isOnPremise || packages.length === 0) {
      return;
    }

    const packageNames = packages.map((pkg) => pkg.name);
    const noDashDistro = distribution.replace('-', '');

    (async () => {
      try {
        const response = await fetchRecommendedPackages({
          recommendPackageRequest: {
            packages: packageNames,
            recommendedPackages: 5,
            distribution: noDashDistro,
          },
        });

        // there is a mismatch between API type and real data
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response?.data?.packages && response.data.packages.length > 0) {
          analytics.track(
            `${AMPLITUDE_MODULE_NAME} - Package Recommendations Found`,
            {
              module: AMPLITUDE_MODULE_NAME,
              isPreview: isBeta(),
              foundRecommendations: response.data.packages,
              selectedPackages: packageNames,
              distribution: noDashDistro,
              modelVersion: response.data.modelVersion,
            },
          );
        }
      } catch {
        // error state handled by isErrorRecommendations
      }
    })();
    // fetchRecommendedPackages, resetRecommendations, analytics, and isBeta
    // are unstable dependencies that were causing an infinite loop when
    // included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, distribution, isOnPremise]);

  useEffect(() => {
    if (
      isSuccessDistroRepos &&
      // there is a mismatch between API type and real data
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      distroRepos?.data &&
      recommendationsData?.packages &&
      recommendationsData.packages.length > 0
    ) {
      const distroRepoUrls = distroRepos.data.map((repo) => repo.url || '');

      fetchRecommendationDescriptions({
        apiContentUnitSearchRequest: {
          exact_names: recommendationsData.packages,
          urls: distroRepoUrls,
        },
      });
    }
  }, [
    isSuccessDistroRepos,
    distroRepos,
    recommendationsData,
    fetchRecommendationDescriptions,
  ]);

  const transformedRecommendations = useMemo(() => {
    if (
      packageType === 'groups' ||
      !isSuccessDescriptions ||
      !recommendationsData?.packages
    ) {
      return [];
    }

    return recommendationsData.packages.map((pkgName): IBPackage => {
      const match = dataDescriptions.find((p) => p.package_name === pkgName);
      return {
        name: pkgName,
        summary: match?.summary || '',
        isRecommendation: true,
      };
    });
  }, [
    packageType,
    isSuccessDescriptions,
    recommendationsData,
    dataDescriptions,
  ]);

  return {
    transformedRecommendations,
    isLoadingRecommendations,
    isErrorRecommendations,
    recommendationsData,
  };
};
