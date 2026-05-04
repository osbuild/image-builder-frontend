import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Content,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { OptimizeIcon, SearchIcon, TimesIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { orderBy } from 'lodash';

import { excludeEUSReposFilter } from '@/Components/CreateImageWizard/steps/Repositories/repositoriesUtilities';
import {
  AMPLITUDE_MODULE_NAME,
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '@/constants';
import {
  Module,
  useGetArchitecturesQuery,
  useRecommendPackageMutation,
  useSecuritySummary,
} from '@/store/api/backend';
import {
  ApiRepositoryCollectionResponseRead,
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
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectGroups,
  selectModules,
  selectPackages,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectWizardMode,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import { convertStringToDate } from '@/Utilities/time';
import useDebounce from '@/Utilities/useDebounce';

import ManageRepositoriesButton from '../../Repositories/components/ManageRepositoriesButton';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  ItemWithSources,
} from '../packagesTypes';

type PackageSearchProps = {
  packageType: 'packages' | 'groups';
  isSuccessEpelRepo: boolean;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
  setIsRepoModalOpen: (value: boolean) => void;
  setIsSelectingPackage: (
    value: IBPackageWithRepositoryInfo | undefined,
  ) => void;
  setIsSelectingGroup: (value: GroupWithRepositoryInfo | undefined) => void;
  activeStream: string;
  setActiveStream: (value: string) => void;
};

const PackageSearch = ({
  packageType,
  isSuccessEpelRepo,
  epelRepo,
  setIsRepoModalOpen,
  setIsSelectingPackage,
  setIsSelectingGroup,
  activeStream,
  setActiveStream,
}: PackageSearchProps) => {
  const dispatch = useAppDispatch();
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const modules = useAppSelector(selectModules);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const wizardMode = useAppSelector(selectWizardMode);

  const { packages: requiredPackages } = useSecuritySummary();
  const requiredSet = useMemo(
    () => new Set(requiredPackages),
    [requiredPackages],
  );

  const isRequiredAndSelected = (pkg: IBPackageWithRepositoryInfo) =>
    requiredSet.has(pkg.name) && packages.some((p) => p.name === pkg.name);

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
    },
  ] = useRecommendPackageMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingOtherRepos, setIsSearchingOtherRepos] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const [hasTrackedRecommendations, setHasTrackedRecommendations] =
    useState(false);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: templateData } = useGetTemplateQuery({
    uuid: template,
  });

  const EMPTY_ARRAY: never[] = useMemo(() => [], []);
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
      distribution: asDistribution(distribution),
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

  const [
    fetchRecommendationDescriptions,
    { data: dataDescriptions, isSuccess: isSuccessDescriptions },
  ] = useSearchRpmMutation();

  useEffect(() => {
    if (!isOnPremise && packages.length > 0) {
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
    }
    // fetchRecommendedPackages, analytics, and isBeta are unstable dependencies
    // that were causing an infinite loop when included in the dependency array
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

  const transformedPackages = useMemo(() => {
    let transformedDistroData: ItemWithSources[] = [];
    let transformedCustomData: ItemWithSources[] = [];
    let transformedRecommendedData: ItemWithSources[] = [];

    if (isSuccessDistroPackages && !isSearchingOtherRepos) {
      transformedDistroData = dataDistroPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'distro',
        sources: values.package_sources,
      }));
    }

    if (isSuccessCustomPackages && !isSearchingOtherRepos) {
      transformedCustomData = dataCustomPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'custom',
        sources: values.package_sources,
      }));
    }

    if (isSuccessRecommendedPackages && isSearchingOtherRepos) {
      transformedRecommendedData = dataRecommendedPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'recommended',
        sources: values.package_sources,
      }));
    }

    const combinedPackageData = transformedDistroData
      .concat(transformedCustomData)
      .concat(transformedRecommendedData);

    let unpackedData: IBPackageWithRepositoryInfo[] =
      combinedPackageData.flatMap((item) => {
        // Spread modules into separate rows by application stream
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
    unpackedData = orderBy(
      unpackedData,
      [
        'name',
        (pkg) => pkg.stream || '',
        (pkg) => pkg.repository || '',
        (pkg) => pkg.module_name || '',
      ],
      ['asc', 'desc', 'asc', 'asc'],
    );

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
    let combinedGroupData: GroupWithRepositoryInfo[] = [];

    if (isSuccessDistroGroups && !isSearchingOtherRepos) {
      combinedGroupData = combinedGroupData.concat(
        dataDistroGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'distro',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessCustomGroups && !isSearchingOtherRepos) {
      combinedGroupData = combinedGroupData.concat(
        dataCustomGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'custom',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessRecommendedGroups && isSearchingOtherRepos) {
      combinedGroupData = combinedGroupData.concat(
        dataRecommendedGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'recommended',
          package_list: values.package_list!,
        })),
      );
    }

    return combinedGroupData;
  }, [
    dataDistroGroups,
    dataCustomGroups,
    dataRecommendedGroups,
    isSuccessDistroGroups,
    isSuccessCustomGroups,
    isSuccessRecommendedGroups,
    isSearchingOtherRepos,
  ]);

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
          recommendationsShown: false,
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
    transformedRecommendations.length,
  ]);

  const sortedPackages = useMemo(() => {
    if (!debouncedSearchTerm) {
      return isLoadingRecommendations ? [] : transformedRecommendations;
    }

    if (transformedPackages.length < 1 || !Array.isArray(transformedPackages)) {
      return isLoadingRecommendations ? [] : transformedRecommendations;
    }

    const regularPackages = orderBy(
      transformedPackages,
      [
        (pkg) => (activeStream && pkg.stream === activeStream ? 0 : 1),
        'name',
        (pkg) => {
          if (!pkg.stream) return '';
          const parts = pkg.stream
            .split('.')
            .map((part: string) => parseInt(part, 10) || 0);
          return parts
            .map((p: number) => p.toString().padStart(10, '0'))
            .join('.');
        },
        (pkg) => pkg.end_date || '9999-12-31',
        (pkg) => pkg.repository || '',
        (pkg) => pkg.module_name || '',
      ],
      ['asc', 'asc', 'desc', 'asc', 'asc', 'asc'],
    );

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

  const isSelectDisabled = (pkg: IBPackageWithRepositoryInfo) => {
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

    const isRequired = isRequiredAndSelected(pkg);

    return (
      isModuleDisabledByPackage ||
      isPackageDisabledByModule ||
      isModuleStreamConflict ||
      isRequired
    );
  };

  const getPackageDescription = (pkg: IBPackageWithRepositoryInfo) => {
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

  const packageTypeLabel =
    packageType === 'packages' ? 'packages' : 'package groups';

  const selectedPackageKeys = useMemo(
    () => packages.map((p) => `${p.name}|||${p.stream || ''}`),
    [packages],
  );
  const selectedGroupNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const onInputClick = () => {
    if (!isOpen && (searchTerm || transformedRecommendations.length > 0)) {
      setIsOpen(true);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
    if (value === '') {
      setActiveStream('');
      setIsSearchingOtherRepos(false);
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setSearchTerm('');
    setIsOpen(false);
    setActiveStream('');
    setIsSearchingOtherRepos(false);
  };

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
          epelRepo &&
          epelRepo.data &&
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
        dispatch(removePackage(pkg.name));
        if (pkg.type === 'module' && pkg.module_name) {
          dispatch(removeModule(pkg.module_name));
        }
        if (
          isSuccessEpelRepo &&
          epelRepo &&
          epelRepo.data &&
          packages.filter((pkg) => pkg.repository === 'recommended').length ===
            1 &&
          groups.filter((grp) => grp.repository === 'recommended').length === 0
        ) {
          dispatch(removeRecommendedRepository(epelRepo.data[0]));
        }
      }
    } else {
      const grp = transformedGroups.find((g) => g.name === value);
      if (!grp) return;

      const isSelected = groups.some((g) => g.name === grp.name);

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          epelRepo &&
          epelRepo.data &&
          grp.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setIsRepoModalOpen(true);
          setIsSelectingGroup(grp);
        } else {
          dispatch(addPackageGroup(grp));
        }
      } else {
        dispatch(removePackageGroup(grp.name));
        if (
          isSuccessEpelRepo &&
          epelRepo &&
          epelRepo.data &&
          groups.filter((grp) => grp.repository === 'recommended').length ===
            1 &&
          packages.filter((pkg) => pkg.repository === 'recommended').length ===
            0
        ) {
          dispatch(removeRecommendedRepository(epelRepo.data[0]));
        }
      }
    }

    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant='typeahead'
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={searchTerm}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          isExpanded={isOpen}
          icon={<SearchIcon />}
          aria-label={`Search ${packageTypeLabel}`}
          data-testid='packages-search-input'
        />
        <TextInputGroupUtilities>
          <Button
            icon={<TimesIcon />}
            variant='plain'
            onClick={onClearButtonClick}
            aria-label='Clear search'
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup label='Packages'>
      <Select
        isScrollable
        isOpen={isOpen}
        selected={
          packageType === 'packages' ? selectedPackageKeys : selectedGroupNames
        }
        onSelect={onSelect}
        onOpenChange={setIsOpen}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {!debouncedSearchTerm && sortedPackages.length === 0 ? (
            <SelectOption isDisabled>
              Start typing to search {packageTypeLabel}
            </SelectOption>
          ) : packageType === 'packages' && debouncedSearchTerm.length === 1 ? (
            <EmptyState variant='sm'>
              <EmptyStateBody>
                The search value must be greater than 1 character
              </EmptyStateBody>
            </EmptyState>
          ) : isLoadingDistroPackages ||
            isLoadingCustomPackages ||
            isLoadingRecommendedPackages ||
            isLoadingDistroGroups ||
            isLoadingCustomGroups ||
            isLoadingRecommendedGroups ? (
            <SelectOption isDisabled>
              Searching {packageTypeLabel}...
            </SelectOption>
          ) : packageType === 'packages' && sortedPackages.length > 0 ? (
            <>
              {sortedPackages.slice(0, 50).map((pkg) => (
                <SelectOption
                  key={`${pkg.name}-${pkg.repository}-${pkg.stream || ''}`}
                  value={`${pkg.name}|||${pkg.stream || ''}`}
                  description={
                    pkg.isRecommendation
                      ? 'Suggested based on your selections. Enabled by RHEL Lightspeed'
                      : getPackageDescription(pkg)
                  }
                  isDisabled={isSelectDisabled(pkg)}
                >
                  {pkg.isRecommendation && (
                    <>
                      <OptimizeIcon color='var(--pf-t--global--icon--color--brand--default)' />{' '}
                    </>
                  )}
                  {pkg.isRecommendation && pkg.summary
                    ? `${pkg.name} - ${pkg.summary}`
                    : pkg.name}
                </SelectOption>
              ))}
              {isLoadingRecommendations && (
                <SelectOption isDisabled>
                  Getting package recommendations...
                </SelectOption>
              )}
            </>
          ) : packageType === 'groups' && transformedGroups.length > 0 ? (
            transformedGroups.slice(0, 50).map((group) => (
              <SelectOption
                key={`${group.name}-${group.repository}`}
                value={group.name}
                description={group.description}
              >
                {group.name}
              </SelectOption>
            ))
          ) : isLoadingRecommendations &&
            packageType === 'packages' &&
            !sortedPackages.length ? (
            <SelectOption isDisabled>
              Getting package recommendations...
            </SelectOption>
          ) : !isSearchingOtherRepos && !isOnPremise ? (
            <EmptyState variant='sm'>
              <EmptyStateBody>
                No results for &quot;{debouncedSearchTerm}&quot; in selected
                repositories. If you know the name of your repository, make sure
                it&apos;s included on the{' '}
                <ManageRepositoriesButton
                  label='Repositories page'
                  icon={true}
                />
              </EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button
                    variant='secondary'
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchingOtherRepos(true);
                    }}
                  >
                    Search repositories outside of this image
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            </EmptyState>
          ) : (
            <SelectOption isDisabled>
              No {packageTypeLabel} found for &quot;{debouncedSearchTerm}&quot;
            </SelectOption>
          )}
        </SelectList>
        {isSearchingOtherRepos &&
          (sortedPackages.length > 0 || transformedGroups.length > 0) && (
            <>
              <Divider />
              <Content style={{ padding: '8px 16px' }}>
                <Content component='small'>
                  Showing results from other repositories (EPEL)
                </Content>
              </Content>
            </>
          )}
      </Select>
      {isErrorRecommendations && packageType === 'packages' && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error'>
              Recommendations couldn&apos;t be fetched. Try again by changing
              your selected packages.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default PackageSearch;
