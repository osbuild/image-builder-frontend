import { IBPackage } from '@/store/slices/wizard';
import useDebounce from '@/Utilities/useDebounce';

import { useGroupSearch } from './useGroupSearch';
import { usePackageSearch } from './usePackageSearch';

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
  const debouncedSearchTerm = useDebounce(searchTerm.trim());

  const { sortedPackages, isLoading: isLoadingPackages } = usePackageSearch({
    debouncedSearchTerm,
    packageType,
    isSearchingOtherRepos,
    activeStream,
    transformedRecommendations,
    isLoadingRecommendations,
  });

  const { transformedGroups, isLoading: isLoadingGroups } = useGroupSearch({
    debouncedSearchTerm,
    packageType,
    isSearchingOtherRepos,
  });

  return {
    sortedPackages,
    transformedGroups,
    debouncedSearchTerm,
    isLoading: isLoadingPackages || isLoadingGroups,
  };
};
