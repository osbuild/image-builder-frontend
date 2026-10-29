import { useEffect, useMemo } from 'react';

import {
  ApiSearchRpmResponse,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { IBPackage, IBPackageWithSources } from '@/store/slices/wizard';

import { useRestoreModuleInEdit } from './useRestoreModuleInEdit';
import { useSearchSetup } from './useSearchSetup';

type UsePackageSearchArgs = {
  debouncedSearchTerm: string;
  packageType: 'packages' | 'groups';
  isSearchingOtherRepos: boolean;
  activeStream: string;
  transformedRecommendations: IBPackage[];
  isLoadingRecommendations: boolean;
};

export const usePackageSearch = ({
  debouncedSearchTerm,
  packageType,
  isSearchingOtherRepos,
  activeStream,
  transformedRecommendations,
  isLoadingRecommendations,
}: UsePackageSearchArgs) => {
  const {
    isOnPremise,
    distribution,
    arch,
    template,
    distroUrls,
    customRepoUuids,
    reposInTemplate,
    isSuccessDistroRepositories,
    formattedSnapshotDate,
    epelRepoUrlByDistribution,
  } = useSearchSetup();

  const [
    searchCustomRpms,
    {
      data: dataCustomPackages,
      isSuccess: isSuccessCustomPackages,
      isLoading: isLoadingCustomPackages,
    },
  ] = useSearchRpmMutation();

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

  useRestoreModuleInEdit(
    distroUrls,
    isSuccessDistroRepositories,
    epelRepoUrlByDistribution,
  );

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
    if (debouncedSearchTerm.length > 2 && customRepoUuids.length > 0) {
      searchCustomRpms({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          uuids: customRepoUuids,
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
    customRepoUuids,
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

  const sortedPackages = useMemo(() => {
    if (!debouncedSearchTerm || transformedPackages.length === 0) {
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
    isLoadingRecommendedPackages;

  return {
    sortedPackages,
    isLoading,
  };
};
