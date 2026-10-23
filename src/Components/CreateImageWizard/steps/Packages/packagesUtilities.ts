import React, { useEffect, useMemo, useState } from 'react';

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
  useGetArchitecturesQuery,
  useRecommendPackageMutation,
  useSecuritySummary,
} from '@/store/api/backend';
import {
  ApiRepositoryCollectionResponseRead,
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRepositoryModuleStreamsMutation,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  addModule,
  addPackage,
  addPackageGroup,
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  ItemWithSources,
  PackageRepository,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepositoriesById,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectWizardMode,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import { convertStringToDate } from '@/Utilities/time';
import useDebounce from '@/Utilities/useDebounce';

const EMPTY_ARRAY: never[] = [];

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

    return recommendationsData.packages.map(
      (pkgName): IBPackageWithRepositoryInfo => {
        const match = dataDescriptions.find((p) => p.package_name === pkgName);
        return {
          name: pkgName,
          summary: match?.summary || '',
          repository: 'distro',
          isRecommendation: true,
        };
      },
    );
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

type UsePackageSearchQueriesArgs = {
  packageType: 'packages' | 'groups';
  searchTerm: string;
  isSearchingOtherRepos: boolean;
  activeStream: string;
  transformedRecommendations: IBPackageWithRepositoryInfo[];
  isLoadingRecommendations: boolean;
};

export const usePackageSearchQueries = ({
  packageType,
  searchTerm,
  isSearchingOtherRepos,
  activeStream,
  transformedRecommendations,
  isLoadingRecommendations,
}: UsePackageSearchQueriesArgs) => {
  const dispatch = useAppDispatch();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const packages = useAppSelector(selectPackages);
  const modules = useAppSelector(selectModules);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const wizardMode = useAppSelector(selectWizardMode);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: templateData } = useGetTemplateQuery({
    uuid: template,
  });

  const { data: { data: reposInTemplate = EMPTY_ARRAY } = {} } =
    useListRepositoriesQuery({
      contentType: 'rpm',
      limit: 100,
      offset: 0,
      uuid:
        templateData && templateData.repository_uuids
          ? templateData.repository_uuids.join(',')
          : '',
    });

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useGetArchitecturesQuery({
      distribution: distribution,
    });

  const distroUrls = useMemo(() => {
    const urls = distroRepositories
      ?.find((archItem) => archItem.arch === arch)
      ?.repositories.filter((repo) => !!repo.baseurl)
      .map((repo) => repo.baseurl!);
    return urls ?? EMPTY_ARRAY;
  }, [distroRepositories, arch]);

  const [
    searchCustomRpms,
    {
      data: dataCustomPackages,
      isSuccess: isSuccessCustomPackages,
      isLoading: isLoadingCustomPackages,
    },
  ] = useSearchRpmMutation();

  const debouncedSearchTerm = useDebounce(searchTerm.trim());

  const [
    searchRecommendedRpms,
    {
      data: dataRecommendedPackages,
      isSuccess: isSuccessRecommendedPackages,
      isLoading: isLoadingRecommendedPackages,
    },
  ] = useSearchRpmMutation();

  const [
    searchDistroRpms,
    {
      data: dataDistroPackages,
      isSuccess: isSuccessDistroPackages,
      isLoading: isLoadingDistroPackages,
    },
  ] = useSearchRpmMutation();

  const [
    searchDistroGroups,
    {
      data: dataDistroGroups,
      isSuccess: isSuccessDistroGroups,
      isLoading: isLoadingDistroGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchCustomGroups,
    {
      data: dataCustomGroups,
      isSuccess: isSuccessCustomGroups,
      isLoading: isLoadingCustomGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchRecommendedGroups,
    {
      data: dataRecommendedGroups,
      isSuccess: isSuccessRecommendedGroups,
      isLoading: isLoadingRecommendedGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchModulesInfo,
    { data: dataModulesInfo, isSuccess: isSuccessModulesInfo },
  ] = useSearchRepositoryModuleStreamsMutation();

  useEffect(() => {
    if (packageType === 'groups') {
      return;
    }
    if (debouncedSearchTerm.length > 1 && isSuccessDistroRepositories) {
      if (isOnPremise) {
        searchDistroRpms({
          apiContentUnitSearchRequest: {
            packages: [debouncedSearchTerm],
            architecture: arch,
            distribution,
          },
        });
      } else {
        searchDistroRpms({
          apiContentUnitSearchRequest: {
            search: debouncedSearchTerm,
            urls:
              template === ''
                ? distroUrls
                : reposInTemplate
                    .filter((r) => r.org_id === '-1' && !!r.url)
                    .flatMap((r) =>
                      r.url!.endsWith('/') ? r.url!.slice(0, -1) : r.url!,
                    ),
            limit: 500,
            include_package_sources: true,
            date: snapshotDate
              ? new Date(convertStringToDate(snapshotDate)).toISOString()
              : undefined,
          },
        });
      }
    }
    if (debouncedSearchTerm.length > 2 && customRepositories.length > 0) {
      searchCustomRpms({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          uuids: customRepositories.flatMap((repo) => {
            return repo.id;
          }),
          limit: 500,
          include_package_sources: true,
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (
      debouncedSearchTerm.length > 2 &&
      isSearchingOtherRepos &&
      !isOnPremise
    ) {
      searchRecommendedRpms({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          urls: [epelRepoUrlByDistribution],
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
  }, [
    customRepositories,
    searchCustomRpms,
    searchDistroRpms,
    searchRecommendedRpms,
    debouncedSearchTerm,
    isSuccessDistroRepositories,
    arch,
    template,
    distribution,
    packageType,
    snapshotDate,
    distroUrls,
    isOnPremise,
    reposInTemplate,
    isSearchingOtherRepos,
    epelRepoUrlByDistribution,
  ]);

  useEffect(() => {
    if (packageType === 'packages') {
      return;
    }
    if (isSuccessDistroRepositories) {
      searchDistroGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          urls: distroUrls,
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (customRepositories.length > 0) {
      searchCustomGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          uuids: customRepositories.flatMap((repo) => {
            return repo.id;
          }),
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (isSearchingOtherRepos && !isOnPremise) {
      searchRecommendedGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          urls: [epelRepoUrlByDistribution],
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
  }, [
    customRepositories,
    searchDistroGroups,
    searchCustomGroups,
    searchRecommendedGroups,
    debouncedSearchTerm,
    packageType,
    arch,
    distroRepositories,
    isSuccessDistroRepositories,
    snapshotDate,
    distroUrls,
    isSearchingOtherRepos,
    isOnPremise,
    epelRepoUrlByDistribution,
  ]);

  useEffect(() => {
    if (
      wizardMode !== 'create' &&
      isSuccessDistroRepositories &&
      modules.length > 0
    ) {
      searchModulesInfo({
        apiSearchModuleStreamsRequest: {
          rpm_names: modules.map((module) => module.name),
          urls: [...distroUrls, epelRepoUrlByDistribution],
          uuids: [],
        },
      });
    }
  }, [isSuccessDistroRepositories, modules, distroUrls]);

  useEffect(() => {
    if (!isSuccessModulesInfo) return;

    dataModulesInfo.forEach((module) => {
      const enabledModule = modules.find((m) => m.name === module.module_name);

      module.streams
        ?.find((stream) => stream.stream === enabledModule?.stream)
        ?.package_names?.forEach((packageName) => {
          const existingPackage = packages.find(
            (pkg) => pkg.name === packageName,
          );

          if (existingPackage && module.module_name && enabledModule) {
            dispatch(
              addPackage({
                ...existingPackage,
                type: 'module',
                module_name: module.module_name,
                stream: enabledModule.stream,
              }),
            );
          }
        });
    });
  }, [dataModulesInfo, dispatch, isSuccessModulesInfo, modules]);

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

  const isLoading =
    isLoadingDistroPackages ||
    isLoadingCustomPackages ||
    isLoadingRecommendedPackages ||
    isLoadingDistroGroups ||
    isLoadingCustomGroups ||
    isLoadingRecommendedGroups;

  return {
    sortedPackages,
    transformedGroups,
    debouncedSearchTerm,
    isLoading,
  };
};

type UsePackageSelectionArgs = {
  packageType: 'packages' | 'groups';
  sortedPackages: IBPackageWithRepositoryInfo[];
  transformedGroups: GroupWithRepositoryInfo[];
  recommendationsData: RecommendationsResponse | undefined;
  setActiveStream: (value: string) => void;
};

export const usePackageSelection = ({
  packageType,
  sortedPackages,
  transformedGroups,
  recommendationsData,
  setActiveStream,
}: UsePackageSelectionArgs) => {
  const dispatch = useAppDispatch();
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const modules = useAppSelector(selectModules);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();

  const { isSuccess: isSuccessEpelRepo } = useEpelRepo();
  const { handleRemovePackage, handleRemoveGroup } = useRemovePackageContent();
  const requiredSet = useRequiredPackages();

  const isRequiredAndSelected = (pkg: IBPackageWithRepositoryInfo) =>
    requiredSet.has(pkg.name) && packages.some((p) => p.name === pkg.name);

  const isPackageSelectDisabled = (pkg: IBPackageWithRepositoryInfo) =>
    isSelectDisabled(pkg, packages, modules, requiredSet);

  const selectedPackageKeys = useMemo(
    () => packages.map((p) => `${p.name}|||${p.stream || ''}`),
    [packages],
  );
  const selectedGroupNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (!value || typeof value !== 'string') return;

    if (packageType === 'packages') {
      const [name, stream] = value.split('|||');
      const pkg = sortedPackages.find(
        (p) => p.name === name && (p.stream || '') === stream,
      );
      if (!pkg) return;

      let isSelected = false;

      if (!pkg.type || pkg.type === 'package') {
        const isModuleWithSameName = modules.some(
          (module: Module) => module.name === pkg.name,
        );
        isSelected =
          packages.some(
            (p) => p.name === pkg.name && p.stream === pkg.stream,
          ) && !isModuleWithSameName;
      }

      if (pkg.type === 'module') {
        isSelected =
          packages.some(
            (p) => p.name === pkg.name && p.stream === pkg.stream,
          ) &&
          modules.some(
            (m: Module) =>
              m.name === pkg.module_name && m.stream === pkg.stream,
          );
      }

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          pkg.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setIsRepoModalOpen(true);
          setIsSelectingPackage(pkg);
        } else {
          dispatch(addPackage(pkg));
          if (pkg.isRecommendation && !isOnPremise) {
            analytics.track(
              `${AMPLITUDE_MODULE_NAME} - Recommended Package Added`,
              {
                module: AMPLITUDE_MODULE_NAME,
                isPreview: isBeta(),
                packageName: pkg.name,
                selectedPackages: packages.map((p) => p.name),
                shownRecommendations: recommendationsData?.packages || [],
                distribution: distribution.replace('-', ''),
                modelVersion: recommendationsData?.modelVersion,
              },
            );
          }
          if (pkg.type === 'module') {
            setActiveStream(pkg.stream || '');
            dispatch(
              addModule({
                name: pkg.module_name || '',
                stream: pkg.stream || '',
              }),
            );
          }
        }
      } else if (!isRequiredAndSelected(pkg)) {
        handleRemovePackage(pkg);
      }
    } else {
      const grp = transformedGroups.find((g) => g.name === value);
      if (!grp) return;

      const isSelected = groups.some((g) => g.name === grp.name);

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          grp.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setIsRepoModalOpen(true);
          setIsSelectingGroup(grp);
        } else {
          dispatch(addPackageGroup(grp));
        }
      } else {
        handleRemoveGroup(grp);
      }
    }
  };

  return {
    onSelect,
    isPackageSelectDisabled,
    isRepoModalOpen,
    setIsRepoModalOpen,
    isSelectingPackage,
    setIsSelectingPackage,
    isSelectingGroup,
    selectedPackageKeys,
    selectedGroupNames,
  };
};
