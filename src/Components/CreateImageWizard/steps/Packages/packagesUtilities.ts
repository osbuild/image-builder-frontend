import { useEffect, useMemo, useState } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { excludeEUSReposFilter } from '@/Components/CreateImageWizard/steps/Repositories/repositoriesUtilities';
import {
  AMPLITUDE_MODULE_NAME,
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '@/constants';
import {
  Module,
  RecommendationsResponse,
  useRecommendPackageMutation,
  useSecuritySummary,
} from '@/store/api/backend';
import {
  ApiRepositoryCollectionResponseRead,
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
  useListRepositoriesQuery,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  ItemWithSources,
  PackageRepository,
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
    data: distroRepos,
    isSuccess: isSuccessDistroRepos,
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
      isSuccessDistroRepos &&
      // there is a mismatch between API type and real data
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      distroRepos?.data &&
      recommendationsData?.packages &&
      recommendationsData.packages.length > 0
    ) {
      const distroRepoUrls = distroRepos.data.map(
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

    return recommendationsData.packages.map(
      (pkgName): IBPackageWithRepositoryInfo => {
        const match = dataDescriptions.find(
          (p) => p.package_name === pkgName,
        );
        return {
          name: pkgName,
          summary: match?.summary || '',
          repository: 'distro',
          isRecommendation: true,
        };
      },
    );
  }, [packageType, isSuccessDescriptions, recommendationsData, dataDescriptions]);

  return {
    transformedRecommendations,
    isLoadingRecommendations,
    isErrorRecommendations,
    recommendationsData,
  };
};

export const useSearchAnalytics = (
  isOpen: boolean,
  packageType: 'packages' | 'groups',
  transformedRecommendations: IBPackageWithRepositoryInfo[],
  recommendationsData: RecommendationsResponse | undefined,
) => {
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const packages = useAppSelector(selectPackages);
  const distribution = useAppSelector(selectDistribution);

  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const [hasTrackedRecommendations, setHasTrackedRecommendations] =
    useState(false);

  useEffect(() => {
    if (!isOpen || packageType !== 'packages' || isOnPremise) {
      if (!isOpen) {
        setHasTrackedOpen(false);
        setHasTrackedRecommendations(false);
      }
      return;
    }

    if (!hasTrackedOpen) {
      analytics.track(
        `${AMPLITUDE_MODULE_NAME} - Package Search Dropdown Opened`,
        {
          module: AMPLITUDE_MODULE_NAME,
          isPreview: isBeta(),
          selectedPackages: packages.map((pkg) => pkg.name),
          recommendationsShown: transformedRecommendations.length > 0,
        },
      );
      setHasTrackedOpen(true);
    }

    if (transformedRecommendations.length > 0 && !hasTrackedRecommendations) {
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
      setHasTrackedRecommendations(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    hasTrackedOpen,
    hasTrackedRecommendations,
    transformedRecommendations,
  ]);
};

type UseTransformedSearchResultsArgs = {
  dataDistroPackages: ApiSearchRpmResponse[] | undefined;
  dataCustomPackages: ApiSearchRpmResponse[] | undefined;
  dataRecommendedPackages: ApiSearchRpmResponse[] | undefined;
  isSuccessDistroPackages: boolean;
  isSuccessCustomPackages: boolean;
  isSuccessRecommendedPackages: boolean;
  dataDistroGroups: ApiSearchPackageGroupResponse[] | undefined;
  dataCustomGroups: ApiSearchPackageGroupResponse[] | undefined;
  dataRecommendedGroups: ApiSearchPackageGroupResponse[] | undefined;
  isSuccessDistroGroups: boolean;
  isSuccessCustomGroups: boolean;
  isSuccessRecommendedGroups: boolean;
  isSearchingOtherRepos: boolean;
  debouncedSearchTerm: string;
  activeStream: string;
  transformedRecommendations: IBPackageWithRepositoryInfo[];
  isLoadingRecommendations: boolean;
};

export const useTransformedSearchResults = ({
  dataDistroPackages,
  dataCustomPackages,
  dataRecommendedPackages,
  isSuccessDistroPackages,
  isSuccessCustomPackages,
  isSuccessRecommendedPackages,
  dataDistroGroups,
  dataCustomGroups,
  dataRecommendedGroups,
  isSuccessDistroGroups,
  isSuccessCustomGroups,
  isSuccessRecommendedGroups,
  isSearchingOtherRepos,
  debouncedSearchTerm,
  activeStream,
  transformedRecommendations,
  isLoadingRecommendations,
}: UseTransformedSearchResultsArgs) => {
  const transformedPackages = useMemo(() => {
    const mapRpms = (
      data: ApiSearchRpmResponse[],
      repository: PackageRepository,
    ): ItemWithSources[] =>
      data.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository,
        sources: values.package_sources,
      }));

    const transformedDistroData =
      isSuccessDistroPackages && !isSearchingOtherRepos
        ? mapRpms(dataDistroPackages!, 'distro')
        : [];

    const transformedCustomData =
      isSuccessCustomPackages && !isSearchingOtherRepos
        ? mapRpms(dataCustomPackages!, 'custom')
        : [];

    const transformedRecommendedData =
      isSuccessRecommendedPackages && isSearchingOtherRepos
        ? mapRpms(dataRecommendedPackages!, 'recommended')
        : [];

    // Spread modules into separate rows by application stream
    const unpackedData: IBPackageWithRepositoryInfo[] = [
      ...transformedDistroData,
      ...transformedCustomData,
      ...transformedRecommendedData,
    ].flatMap((item) => {
      if (item.sources) {
        return item.sources.map((source) => ({
          name: item.name,
          summary: item.summary,
          repository: item.repository,
          type: source.type,
          module_name: source.name,
          stream: source.stream,
          end_date: source.end_date,
        }));
      }
      return [
        {
          name: item.name,
          summary: item.summary,
          repository: item.repository,
        },
      ];
    });

    // group by name, but sort by application stream in descending order
    unpackedData.sort((a, b) => {
      // By name (asc)
      if (a.name !== b.name) return a.name.localeCompare(b.name);

      // By stream (desc)
      const aStream = a.stream || '';
      const bStream = b.stream || '';
      if (aStream !== bStream) return bStream.localeCompare(aStream);

      // By repository (asc)
      const aRepo = a.repository || '';
      const bRepo = b.repository || '';
      if (aRepo !== bRepo) return aRepo.localeCompare(bRepo);

      // By module_name (asc)
      const aModule = a.module_name || '';
      const bModule = b.module_name || '';
      return aModule.localeCompare(bModule);
    });

    return unpackedData;
  }, [
    dataCustomPackages,
    dataDistroPackages,
    dataRecommendedPackages,
    isSuccessCustomPackages,
    isSuccessDistroPackages,
    isSuccessRecommendedPackages,
    isSearchingOtherRepos,
  ]);

  const transformedGroups = useMemo(() => {
    const mapGroups = (
      data: ApiSearchPackageGroupResponse[],
      repository: PackageRepository,
    ): GroupWithRepositoryInfo[] =>
      data.map((values) => ({
        name: values.id!,
        description: values.description!,
        repository,
        package_list: values.package_list!,
      }));

    const distroGroups =
      isSuccessDistroGroups && !isSearchingOtherRepos
        ? mapGroups(dataDistroGroups!, 'distro')
        : [];

    const customGroups =
      isSuccessCustomGroups && !isSearchingOtherRepos
        ? mapGroups(dataCustomGroups!, 'custom')
        : [];

    const recommendedGroups =
      isSuccessRecommendedGroups && isSearchingOtherRepos
        ? mapGroups(dataRecommendedGroups!, 'recommended')
        : [];

    return [...distroGroups, ...customGroups, ...recommendedGroups];
  }, [
    dataDistroGroups,
    dataCustomGroups,
    dataRecommendedGroups,
    isSuccessDistroGroups,
    isSuccessCustomGroups,
    isSuccessRecommendedGroups,
    isSearchingOtherRepos,
  ]);

  const sortedPackages = useMemo(() => {
    if (!debouncedSearchTerm) {
      return isLoadingRecommendations ? [] : transformedRecommendations;
    }

    if (transformedPackages.length === 0) {
      return isLoadingRecommendations ? [] : transformedRecommendations;
    }

    const regularPackages = [...transformedPackages].sort((a, b) => {
      // Active stream packages first (if activeStream is set)
      const aIsActive = activeStream && a.stream === activeStream ? 0 : 1;
      const bIsActive = activeStream && b.stream === activeStream ? 0 : 1;
      if (aIsActive !== bIsActive) return aIsActive - bIsActive;

      // Then by name (asc)
      if (a.name !== b.name) return a.name.localeCompare(b.name);

      // Then by stream version (desc)
      const aStream = a.stream || '';
      const bStream = b.stream || '';
      if (aStream !== bStream) {
        if (!aStream) return 1;
        if (!bStream) return -1;
        const aParts = aStream
          .split('.')
          .map((part) => parseInt(part, 10) || 0);
        const bParts = bStream
          .split('.')
          .map((part) => parseInt(part, 10) || 0);
        const aVersion = aParts
          .map((p) => p.toString().padStart(10, '0'))
          .join('.');
        const bVersion = bParts
          .map((p) => p.toString().padStart(10, '0'))
          .join('.');
        return bVersion.localeCompare(aVersion); // descending
      }

      // Then by end date (asc, nulls last)
      const aEndDate = a.end_date || '9999-12-31';
      const bEndDate = b.end_date || '9999-12-31';
      if (aEndDate !== bEndDate) return aEndDate.localeCompare(bEndDate);

      // Then by repository (asc)
      const aRepo = a.repository || '';
      const bRepo = b.repository || '';
      if (aRepo !== bRepo) return aRepo.localeCompare(bRepo);

      // Finally by module name (asc)
      const aModule = a.module_name || '';
      const bModule = b.module_name || '';
      return aModule.localeCompare(bModule);
    });

    const hasModules = regularPackages.some((pkg) => pkg.type === 'module');
    const filteredRecommendations =
      isLoadingRecommendations || hasModules
        ? []
        : transformedRecommendations.filter(
            (rec) => !regularPackages.some((pkg) => pkg.name === rec.name),
          );

    return [...regularPackages, ...filteredRecommendations];
  }, [
    debouncedSearchTerm,
    transformedPackages,
    activeStream,
    transformedRecommendations,
    isLoadingRecommendations,
  ]);

  return { transformedPackages, transformedGroups, sortedPackages };
};
