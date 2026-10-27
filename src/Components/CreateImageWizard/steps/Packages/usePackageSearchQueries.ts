import { useEffect, useMemo } from 'react';

import { EPEL_10_REPO_DEFINITION } from '@/constants';
import { useGetArchitecturesQuery } from '@/store/api/backend';
import {
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  IBPackage,
  IBPackageGroup,
  IBPackageWithSources,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectSnapshotDate,
  selectTemplate,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { convertStringToDate } from '@/Utilities/time';
import useDebounce from '@/Utilities/useDebounce';

import { useRestoreModuleInEdit } from './useRestoreModuleInEdit';

const EMPTY_ARRAY: never[] = [];

type UsePackageSearchQueriesArgs = {
  packageType: 'packages' | 'groups';
  searchTerm: string;
  isSearchingOtherRepos: boolean;
  activeStream: string;
  transformedRecommendations: IBPackage[];
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
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const formattedSnapshotDate = snapshotDate
    ? new Date(convertStringToDate(snapshotDate)).toISOString()
    : undefined;

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

  useRestoreModuleInEdit(distroUrls, isSuccessDistroRepositories);

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
            date: formattedSnapshotDate,
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
          date: formattedSnapshotDate,
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
          date: formattedSnapshotDate,
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
    formattedSnapshotDate,
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
          date: formattedSnapshotDate,
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
          date: formattedSnapshotDate,
        },
      });
    }
    if (isSearchingOtherRepos && !isOnPremise) {
      searchRecommendedGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          urls: [epelRepoUrlByDistribution],
          date: formattedSnapshotDate,
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
    formattedSnapshotDate,
    distroUrls,
    isSearchingOtherRepos,
    isOnPremise,
    epelRepoUrlByDistribution,
  ]);

  const transformedPackages = useMemo(() => {
    const mapRpms = (
      data: ApiSearchRpmResponse[],
      isRecommendedRepository?: boolean,
    ): IBPackageWithSources[] =>
      data.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        ...(isRecommendedRepository && { isRecommendedRepository }),
        sources: values.package_sources,
      }));

    const transformedDistroData =
      isSuccessDistroPackages && !isSearchingOtherRepos
        ? mapRpms(dataDistroPackages!)
        : [];

    const transformedCustomData =
      isSuccessCustomPackages && !isSearchingOtherRepos
        ? mapRpms(dataCustomPackages!)
        : [];

    const transformedRecommendedData =
      isSuccessRecommendedPackages && isSearchingOtherRepos
        ? mapRpms(dataRecommendedPackages!, true)
        : [];

    // Spread modules into separate rows by application stream
    const unpackedData: IBPackage[] = [
      ...transformedDistroData,
      ...transformedCustomData,
      ...transformedRecommendedData,
    ].flatMap((item) => {
      if (item.sources) {
        return item.sources.map((source) => ({
          name: item.name,
          summary: item.summary,
          ...(item.isRecommendedRepository && {
            isRecommendedRepository: item.isRecommendedRepository,
          }),
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
          ...(item.isRecommendedRepository && {
            isRecommendedRepository: item.isRecommendedRepository,
          }),
        },
      ];
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
      isRecommendedRepository?: boolean,
    ): IBPackageGroup[] =>
      data.map((values) => ({
        name: values.id!,
        description: values.description!,
        ...(isRecommendedRepository && { isRecommendedRepository }),
        package_list: values.package_list ?? [],
      }));

    const distroGroups =
      isSuccessDistroGroups && !isSearchingOtherRepos
        ? mapGroups(dataDistroGroups!)
        : [];

    const customGroups =
      isSuccessCustomGroups && !isSearchingOtherRepos
        ? mapGroups(dataCustomGroups!)
        : [];

    const recommendedGroups =
      isSuccessRecommendedGroups && isSearchingOtherRepos
        ? mapGroups(dataRecommendedGroups!, true)
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
