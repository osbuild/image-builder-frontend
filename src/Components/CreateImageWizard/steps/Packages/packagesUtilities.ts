import { useEffect, useMemo } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { excludeEUSReposFilter } from '@/Components/CreateImageWizard/steps/Repositories/repositoriesUtilities';
import {
  AMPLITUDE_MODULE_NAME,
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '@/constants';
import {
  Module,
  useRecommendPackageMutation,
  useSecuritySummary,
} from '@/store/api/backend';
import {
  ApiRepositoryCollectionResponseRead,
  useListRepositoriesQuery,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepositoriesById,
  selectArchitecture,
  selectDistribution,
  selectPackageGroups,
  selectPackages,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { releaseToVersion } from '@/Utilities/releaseToVersion';

export const getPackageDescription = (pkg: IBPackageWithRepositoryInfo) => {
  const parts = [];

  if (pkg.stream) {
    parts.push(pkg.stream);
  }
  if (pkg.end_date) {
    const retirementDate = new Date(pkg.end_date);
    const formattedDate =
      retirementDate.toLocaleString('en-US', { month: 'short' }) +
      ' ' +
      retirementDate.getFullYear();
    parts.push(formattedDate);
  }
  if (pkg.summary) {
    parts.push(pkg.summary);
  }
  return parts.length === 0 ? '--' : parts.join(', ');
};

export const isSelectDisabled = (
  pkg: IBPackageWithRepositoryInfo,
  packages: IBPackageWithRepositoryInfo[],
  modules: Module[],
  requiredSet: Set<string>,
) => {
  const isModuleDisabledByPackage =
    pkg.type === 'module' &&
    packages.some(
      (p) => (!p.type || p.type === 'package') && p.name === pkg.module_name,
    );

  const isPackageDisabledByModule =
    (!pkg.type || pkg.type === 'package') &&
    modules.some((module: Module) => module.name === pkg.name);

  const isModuleStreamConflict =
    pkg.type === 'module' &&
    modules.some((module: Module) => module.name === pkg.module_name) &&
    !modules.some((m: Module) => m.stream === pkg.stream);

  const isRequired =
    requiredSet.has(pkg.name) && packages.some((p) => p.name === pkg.name);

  return (
    isModuleDisabledByPackage ||
    isPackageDisabledByModule ||
    isModuleStreamConflict ||
    isRequired
  );
};

export const shouldRemoveEpelRepo = (
  isSuccessEpelRepo: boolean,
  epelRepo: ApiRepositoryCollectionResponseRead | undefined,
  packages: IBPackageWithRepositoryInfo[],
  groups: GroupWithRepositoryInfo[],
  removingType: 'package' | 'group',
) => {
  if (!isSuccessEpelRepo || !epelRepo?.data) {
    return false;
  }

  if (removingType === 'package') {
    return (
      packages.filter((pkg) => pkg.repository === 'recommended').length === 1 &&
      groups.filter((grp) => grp.repository === 'recommended').length === 0
    );
  }

  return (
    groups.filter((grp) => grp.repository === 'recommended').length === 1 &&
    packages.filter((pkg) => pkg.repository === 'recommended').length === 0
  );
};

export const useRequiredPackages = () => {
  const { packages: requiredPackages } = useSecuritySummary();
  return useMemo(() => new Set(requiredPackages), [requiredPackages]);
};

export const useEpelRepo = () => {
  const distribution = useAppSelector(selectDistribution);
  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  return useListRepositoriesQuery({
    url: epelRepoUrlByDistribution,
    origin: ContentOrigin.COMMUNITY,
  });
};

export const useRemovePackageContent = () => {
  const dispatch = useAppDispatch();
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const { data: epelRepo, isSuccess: isSuccessEpelRepo } = useEpelRepo();

  const handleRemovePackage = (pkg: IBPackageWithRepositoryInfo) => {
    dispatch(removePackage(pkg.name));
    if (pkg.type === 'module' && pkg.module_name) {
      dispatch(removeModule(pkg.module_name));
    }
    if (
      shouldRemoveEpelRepo(
        isSuccessEpelRepo,
        epelRepo,
        packages,
        groups,
        'package',
      )
    ) {
      dispatch(removeRecommendedRepositoriesById([epelRepo!.data![0].uuid!]));
    }
  };

  const handleRemoveGroup = (grp: GroupWithRepositoryInfo) => {
    dispatch(removePackageGroup(grp.name));
    if (
      shouldRemoveEpelRepo(
        isSuccessEpelRepo,
        epelRepo,
        packages,
        groups,
        'group',
      )
    ) {
      dispatch(removeRecommendedRepositoriesById([epelRepo!.data![0].uuid!]));
    }
  };

  return { handleRemovePackage, handleRemoveGroup };
};

export const usePackageRecommendations = (
  packageType: 'packages' | 'groups',
) => {
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const packages = useAppSelector(selectPackages);

  const version = releaseToVersion(distribution);

  const {
    data: distroRepositoriesForRecommendations,
    isSuccess: isSuccessDistroRepositoriesForRecommendations,
  } = useListRepositoriesQuery({
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
      isSuccessDistroRepositoriesForRecommendations &&
      // there is a mismatch between API type and real data
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      distroRepositoriesForRecommendations?.data &&
      recommendationsData?.packages &&
      recommendationsData.packages.length > 0
    ) {
      const distroRepoUrls = distroRepositoriesForRecommendations.data.map(
        (repo) => repo.url || '',
      );

      fetchRecommendationDescriptions({
        apiContentUnitSearchRequest: {
          exact_names: recommendationsData.packages,
          urls: distroRepoUrls,
        },
      });
    }
  }, [
    isSuccessDistroRepositoriesForRecommendations,
    distroRepositoriesForRecommendations,
    recommendationsData,
    fetchRecommendationDescriptions,
  ]);

  const recommendationsWithDescriptions = useMemo(() => {
    if (!isSuccessDescriptions || !recommendationsData?.packages) {
      return [];
    }
    return recommendationsData.packages.map((pkgName) => {
      const description = dataDescriptions.find(
        (p) => p.package_name === pkgName,
      );
      return {
        name: pkgName,
        summary: description?.summary || '',
      };
    });
  }, [isSuccessDescriptions, recommendationsData, dataDescriptions]);

  const transformedRecommendations = useMemo(() => {
    if (packageType === 'groups' || !recommendationsWithDescriptions.length) {
      return [];
    }

    return recommendationsWithDescriptions.map(
      (rec): IBPackageWithRepositoryInfo => ({
        name: rec.name,
        summary: rec.summary,
        repository: 'distro',
        isRecommendation: true,
      }),
    );
  }, [recommendationsWithDescriptions, packageType]);

  return {
    transformedRecommendations,
    isLoadingRecommendations,
    isErrorRecommendations,
    recommendationsData,
  };
};
