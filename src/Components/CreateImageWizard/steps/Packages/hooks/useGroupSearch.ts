import { useEffect, useMemo } from 'react';

import {
  ApiSearchPackageGroupResponse,
  useSearchPackageGroupMutation,
} from '@/store/api/contentSources';
import { IBPackageGroup } from '@/store/slices/wizard';

import { useSearchSetup } from './useSearchSetup';

type UseGroupSearchArgs = {
  debouncedSearchTerm: string;
  packageType: 'packages' | 'groups';
  isSearchingOtherRepos: boolean;
};

export const useGroupSearch = ({
  debouncedSearchTerm,
  packageType,
  isSearchingOtherRepos,
}: UseGroupSearchArgs) => {
  const {
    isOnPremise,
    distroUrls,
    customRepoUuids,
    isSuccessDistroRepositories,
    formattedSnapshotDate,
    epelRepoUrlByDistribution,
  } = useSearchSetup();

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
    if (customRepoUuids.length > 0) {
      searchCustomGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          uuids: customRepoUuids,
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
    customRepoUuids,
    searchDistroGroups,
    searchCustomGroups,
    searchRecommendedGroups,
    debouncedSearchTerm,
    packageType,
    isSuccessDistroRepositories,
    formattedSnapshotDate,
    distroUrls,
    isSearchingOtherRepos,
    isOnPremise,
    epelRepoUrlByDistribution,
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

  const isLoading =
    isLoadingDistroGroups ||
    isLoadingCustomGroups ||
    isLoadingRecommendedGroups;

  return {
    transformedGroups,
    isLoading,
  };
};
