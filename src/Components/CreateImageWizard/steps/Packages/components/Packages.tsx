import React, { ReactElement, useEffect, useMemo, useState } from 'react';

import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Pagination,
  PaginationVariant,
  Popover,
  SearchInput,
  Stack,
  Tab,
  Tabs,
  TabTitleText,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { orderBy } from 'lodash';
import { useDispatch } from 'react-redux';

import CustomHelperText from './CustomHelperText';
import EmptySearch from './EmptySearch';
import NoResultsFound from './NoResultsFound';
import PackageInfoNotAvailablePopover from './PackageInfoNotAvailablePopover';
import { IncludedReposPopover, OtherReposPopover } from './RepoPopovers';
import RepositoryModal from './RepositoryModal';
import RetirementDate from './RetirementDate';
import Searching from './Searching';
import TooShort from './TooShort';
import TryLookingUnderIncluded from './TryLookingUnderIncluded';

import {
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '../../../../../constants';
import { useGetArchitecturesQuery } from '../../../../../store/backendApi';
import {
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRepositoryModuleStreamsMutation,
  useSearchRpmMutation,
} from '../../../../../store/contentSourcesApi';
import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { asDistribution } from '../../../../../store/typeGuards';
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
} from '../../../../../store/wizardSlice';
import { getEpelUrlForDistribution } from '../../../../../Utilities/epel';
import { convertStringToDate } from '../../../../../Utilities/time';
import useDebounce from '../../../../../Utilities/useDebounce';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  ItemWithSources,
  Repos,
} from '../packagesTypes';
import { getPackageUniqueKey } from '../packagesUtilities';

const Packages = () => {
  const dispatch = useDispatch();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const modules = useAppSelector(selectModules);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const wizardMode = useAppSelector(selectWizardMode);

  const { data: templateData } = useGetTemplateQuery({
    uuid: template,
  });

  const {
    data: { data: reposInTemplate = [] } = {},
    isLoading: isLoadingReposInTemplate,
  } = useListRepositoriesQuery({
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

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.EXTERNAL,
    });

  const distroUrls = useMemo(() => {
    return (
      distroRepositories
        ?.find((archItem) => archItem.arch === arch)
        ?.repositories.filter((repo) => !!repo.baseurl)
        .map((repo) => repo.baseurl!) ?? []
    );
  }, [distroRepositories, arch]);

  const [currentlyRemovedPackages, setCurrentlyRemovedPackages] = useState<
    IBPackageWithRepositoryInfo[]
  >([]);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [toggleSelected, setToggleSelected] = useState('toggle-available');
  const [activeTabKey, setActiveTabKey] = useState(Repos.INCLUDED);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeStream, setActiveStream] = useState<string>('');
  const [
    searchCustomRpms,
    {
      data: dataCustomPackages,
      isSuccess: isSuccessCustomPackages,
      isLoading: isLoadingCustomPackages,
    },
  ] = useSearchRpmMutation();

  const debouncedSearchTerm = useDebounce(searchTerm.trim());
  const debouncedSearchTermLengthOf1 = debouncedSearchTerm.length === 1;
  const debouncedSearchTermIsGroup = debouncedSearchTerm.startsWith('@');

  // While it's searching for packages or groups, only show either packages or groups, without mixing the two.
  const showPackages =
    (debouncedSearchTerm && !debouncedSearchTermIsGroup) ||
    toggleSelected === 'toggle-selected';
  const showGroups =
    (debouncedSearchTerm && debouncedSearchTermIsGroup) ||
    toggleSelected === 'toggle-selected';

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
    if (debouncedSearchTermIsGroup) {
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
    if (debouncedSearchTerm.length > 2) {
      if (activeTabKey === Repos.INCLUDED && customRepositories.length > 0) {
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
      } else {
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
    }
  }, [
    customRepositories,
    searchCustomRpms,
    searchDistroRpms,
    debouncedSearchTerm,
    activeTabKey,
    searchRecommendedRpms,
    epelRepoUrlByDistribution,
    isSuccessDistroRepositories,
    distroRepositories,
    arch,
    template,
    distribution,
    debouncedSearchTermIsGroup,
    snapshotDate,
    distroUrls,
  ]);

  useEffect(() => {
    if (!debouncedSearchTermIsGroup) {
      return;
    }
    if (isSuccessDistroRepositories) {
      searchDistroGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
          urls: distroUrls,
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (activeTabKey === Repos.INCLUDED && customRepositories.length > 0) {
      searchCustomGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
          uuids: customRepositories.flatMap((repo) => {
            return repo.id;
          }),
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    } else if (activeTabKey === Repos.OTHER && isSuccessEpelRepo) {
      searchRecommendedGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
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
    activeTabKey,
    epelRepoUrlByDistribution,
    debouncedSearchTermIsGroup,
    arch,
    distroRepositories,
    isSuccessDistroRepositories,
    isSuccessEpelRepo,
    snapshotDate,
    distroUrls,
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
    let transformedDistroData: ItemWithSources[] = [];
    let transformedCustomData: ItemWithSources[] = [];
    let transformedRecommendedData: ItemWithSources[] = [];

    if (isSuccessDistroPackages) {
      transformedDistroData = dataDistroPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'distro',
        sources: values.package_sources,
      }));
    }

    if (isSuccessCustomPackages) {
      transformedCustomData = dataCustomPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'custom',
        sources: values.package_sources,
      }));
    }

    let combinedPackageData = transformedDistroData.concat(
      transformedCustomData,
    );

    if (
      debouncedSearchTerm !== '' &&
      combinedPackageData.length === 0 &&
      isSuccessRecommendedPackages &&
      activeTabKey === Repos.OTHER
    ) {
      transformedRecommendedData = dataRecommendedPackages!.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'recommended',
        sources: values.package_sources,
      }));

      combinedPackageData = combinedPackageData.concat(
        transformedRecommendedData,
      );
    }

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

    if (toggleSelected === 'toggle-available') {
      if (activeTabKey === Repos.INCLUDED) {
        return unpackedData.filter((pkg) => pkg.repository !== 'recommended');
      }
      return unpackedData.filter((pkg) => pkg.repository === 'recommended');
    } else {
      const selectedPackages = [...packages];
      if (currentlyRemovedPackages.length > 0) {
        selectedPackages.push(...currentlyRemovedPackages);
      }
      if (activeTabKey === Repos.INCLUDED) {
        return selectedPackages;
      } else {
        return [];
      }
    }
  }, [
    currentlyRemovedPackages,
    dataCustomPackages,
    dataDistroPackages,
    dataRecommendedPackages,
    debouncedSearchTerm,
    isSuccessCustomPackages,
    isSuccessDistroPackages,
    isSuccessRecommendedPackages,
    packages,
    toggleSelected,
    activeTabKey,
  ]);

  const transformedGroups = useMemo(() => {
    let combinedGroupData: GroupWithRepositoryInfo[] = [];

    if (isSuccessDistroGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataDistroGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'distro',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessCustomGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataCustomGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'custom',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessRecommendedGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataRecommendedGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'recommended',
          package_list: values.package_list!,
        })),
      );
    }

    if (toggleSelected === 'toggle-available') {
      if (activeTabKey === Repos.INCLUDED) {
        return combinedGroupData.filter(
          (pkg) => pkg.repository !== 'recommended',
        );
      } else {
        return combinedGroupData.filter(
          (pkg) => pkg.repository === 'recommended',
        );
      }
    } else {
      const selectedGroups = [...groups];
      if (activeTabKey === Repos.INCLUDED) {
        return selectedGroups;
      } else {
        return [];
      }
    }
  }, [
    dataDistroGroups,
    dataCustomGroups,
    dataRecommendedGroups,
    debouncedSearchTerm,
    isSuccessDistroGroups,
    isSuccessCustomGroups,
    isSuccessRecommendedGroups,
    groups,
    toggleSelected,
    activeTabKey,
  ]);

  const handleSearch = async (
    event: React.FormEvent<HTMLInputElement>,
    selection: string,
  ) => {
    setSearchTerm(selection);
    setActiveTabKey(Repos.INCLUDED);
    setToggleSelected('toggle-available');
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
    setPage(1);
  };

  const handleClear = async () => {
    setSearchTerm('');
    setActiveTabKey(Repos.INCLUDED);
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
  };

  const handleSelect = (
    pkg: IBPackageWithRepositoryInfo,
    _: number,
    isSelecting: boolean,
  ) => {
    if (isSelecting) {
      if (
        isSuccessEpelRepo &&
        epelRepo.data &&
        pkg.repository === 'recommended' &&
        !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
      ) {
        setIsRepoModalOpen(true);
        setIsSelectingPackage(pkg);
      } else {
        dispatch(addPackage(pkg));
        if (pkg.type === 'module') {
          setActiveStream(pkg.stream || '');
          dispatch(
            addModule({
              name: pkg.module_name || '',
              stream: pkg.stream || '',
            }),
          );
        }
        setCurrentlyRemovedPackages((prev) =>
          prev.filter((curr) => curr.name !== pkg.name),
        );
      }
    } else {
      dispatch(removePackage(pkg.name));
      if (pkg.type === 'module' && pkg.module_name) {
        dispatch(removeModule(pkg.module_name));
      }
      setCurrentlyRemovedPackages((last) => [...last, pkg]);
      if (
        isSuccessEpelRepo &&
        epelRepo.data &&
        packages.filter((pkg) => pkg.repository === 'recommended').length ===
          1 &&
        groups.filter((grp) => grp.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const handleGroupSelect = (
    grp: GroupWithRepositoryInfo,
    _: number,
    isSelecting: boolean,
  ) => {
    if (isSelecting) {
      if (
        isSuccessEpelRepo &&
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
        epelRepo.data &&
        groups.filter((grp) => grp.repository === 'recommended').length === 1 &&
        packages.filter((pkg) => pkg.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const handleFilterToggleClick = (
    event:
      | MouseEvent
      | React.KeyboardEvent<Element>
      | React.MouseEvent<HTMLElement, MouseEvent>,
    _selected: boolean,
  ) => {
    const id = (event.currentTarget as HTMLElement).id;
    setCurrentlyRemovedPackages([]);
    setPage(1);
    setToggleSelected(id);
  };

  const handleSetPage = (
    _:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (
    _:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

  const handleTabClick = (
    event?: React.MouseEvent,
    tabIndex?: string | number,
  ) => {
    if (tabIndex === undefined) return;
    if (tabIndex !== activeTabKey) {
      setCurrentlyRemovedPackages([]);
      setPage(1);
      setActiveTabKey(tabIndex as Repos);
    }
  };

  const initialExpandedPkgs: string[] = [];
  const [expandedPkgs, setExpandedPkgs] = useState(initialExpandedPkgs);

  const setPkgExpanded = (
    pkg: IBPackageWithRepositoryInfo,
    isExpanding: boolean,
  ) =>
    setExpandedPkgs((prevExpanded) => {
      const pkgKey = getPackageUniqueKey(pkg);
      const otherExpandedPkgs = prevExpanded.filter((key) => key !== pkgKey);
      return isExpanding ? [...otherExpandedPkgs, pkgKey] : otherExpandedPkgs;
    });

  const isPkgExpanded = (pkg: IBPackageWithRepositoryInfo) =>
    expandedPkgs.includes(getPackageUniqueKey(pkg));

  const initialExpandedGroups: GroupWithRepositoryInfo['name'][] = [];
  const [expandedGroups, setExpandedGroups] = useState(initialExpandedGroups);

  const setGroupsExpanded = (
    group: GroupWithRepositoryInfo['name'],
    isExpanding: boolean,
  ) =>
    setExpandedGroups((prevExpanded) => {
      const otherExpandedGroups = prevExpanded.filter((g) => g !== group);
      return isExpanding
        ? [...otherExpandedGroups, group]
        : otherExpandedGroups;
    });

  const isGroupExpanded = (group: GroupWithRepositoryInfo['name']) =>
    expandedGroups.includes(group);

  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<
    'asc' | 'desc'
  >('asc');

  const sortedPackages = useMemo(() => {
    if (transformedPackages.length < 1 || !Array.isArray(transformedPackages)) {
      return [];
    }

    return orderBy(
      transformedPackages,
      [
        // Active stream packages first (if activeStream is set)
        (pkg) => (activeStream && pkg.stream === activeStream ? 0 : 1),
        // Then by name
        'name',
        // Then by stream version (descending)
        (pkg) => {
          if (!pkg.stream) return '';
          const parts = pkg.stream
            .split('.')
            .map((part: string) => parseInt(part, 10) || 0);
          // Convert to string with zero-padding for proper sorting
          return parts
            .map((p: number) => p.toString().padStart(10, '0'))
            .join('.');
        },
        // Then by end date (nulls last)
        (pkg) => pkg.end_date || '9999-12-31',
        // Then by repository
        (pkg) => pkg.repository || '',
        // Finally by module name
        (pkg) => pkg.module_name || '',
      ],
      ['asc', 'asc', 'desc', 'asc', 'asc', 'asc'],
    );
  }, [transformedPackages, activeStream]);

  const getSortParams = (columnIndex: number) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (
      _event: React.MouseEvent,
      index: number,
      direction: 'asc' | 'desc',
    ) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const isPackageSelected = (pkg: IBPackageWithRepositoryInfo) => {
    let isSelected = false;

    if (!pkg.type || pkg.type === 'package') {
      const isModuleWithSameName = modules.some(
        (module) => module.name === pkg.name,
      );
      isSelected =
        packages.some((p) => p.name === pkg.name && p.stream === pkg.stream) &&
        !isModuleWithSameName;
    }

    if (pkg.type === 'module') {
      // the package is selected if its module stream matches one in enabled_modules
      isSelected =
        packages.some((p) => p.name === pkg.name && p.stream === pkg.stream) &&
        modules.some(
          (m) => m.name === pkg.module_name && m.stream === pkg.stream,
        );
    }

    return isSelected;
  };

  /**
   * Determines if the package's (or group's) select is disabled.
   *
   * Select should be disabled:
   * - if the item is a module
   * - and the module is added to enabled_modules
   * - but the stream doesn't match the stream in enabled_modules
   *
   * @param pkg Package
   * @returns Package (or group) is / is not selected
   */
  const isSelectDisabled = (pkg: IBPackageWithRepositoryInfo) => {
    const isModuleDisabledByPackage =
      pkg.type === 'module' &&
      packages.some(
        (p) => (!p.type || p.type === 'package') && p.name === pkg.module_name,
      );

    const isPackageDisabledByModule =
      (!pkg.type || pkg.type === 'package') &&
      modules.some((module) => module.name === pkg.name);

    const isModuleStreamConflict =
      pkg.type === 'module' &&
      modules.some((module) => module.name === pkg.module_name) &&
      !modules.some((m) => m.stream === pkg.stream);

    return (
      isModuleDisabledByPackage ||
      isPackageDisabledByModule ||
      isModuleStreamConflict
    );
  };

  const composePkgTable = () => {
    let rows: ReactElement[] = [];

    if (showGroups) {
      rows = rows.concat(
        transformedGroups
          .slice(computeStart(), computeEnd())
          .map((grp, rowIndex) => (
            <Tbody
              key={`${grp.name}-${grp.repository || 'default'}`}
              isExpanded={isGroupExpanded(grp.name)}
            >
              <Tr data-testid='package-row'>
                <Td
                  expand={{
                    rowIndex: rowIndex,
                    isExpanded: isGroupExpanded(grp.name),
                    onToggle: () =>
                      setGroupsExpanded(grp.name, !isGroupExpanded(grp.name)),
                    expandId: `${grp.name}-expandable`,
                  }}
                />
                <Td
                  select={{
                    isSelected: groups.some((g) => g.name === grp.name),
                    rowIndex: rowIndex,
                    onSelect: (event, isSelecting) =>
                      handleGroupSelect(grp, rowIndex, isSelecting),
                  }}
                />
                <Td>
                  @{grp.name}{' '}
                  <Popover
                    minWidth='25rem'
                    headerContent='Included packages'
                    bodyContent={
                      <div
                        style={
                          grp.package_list?.length
                            ? { height: '40em', overflow: 'scroll' }
                            : {}
                        }
                      >
                        {grp.package_list?.length ? (
                          <Table
                            variant='compact'
                            data-testid='group-included-packages-table'
                          >
                            <Tbody>
                              {grp.package_list.map((pkg: string) => (
                                <Tr key={`details-${pkg}`}>
                                  <Td>{pkg}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        ) : (
                          <Content>This group has no packages</Content>
                        )}
                      </div>
                    }
                  >
                    <Button
                      icon={<HelpIcon />}
                      variant='plain'
                      aria-label='About included packages'
                      isInline
                      size='sm'
                      hasNoPadding
                    />
                  </Popover>
                </Td>
                <Td>N/A</Td>
                <Td>N/A</Td>
              </Tr>
              <Tr isExpanded={isGroupExpanded(grp.name)}>
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    {
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>
                            Description
                            {toggleSelected === 'toggle-selected' && (
                              <PackageInfoNotAvailablePopover />
                            )}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {grp.description
                              ? grp.description
                              : 'Not available'}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    }
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          )),
      );
    }

    if (showPackages) {
      rows = rows.concat(
        sortedPackages
          .slice(computeStart(), computeEnd())
          .map((pkg, rowIndex) => (
            <Tbody
              key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
              isExpanded={isPkgExpanded(pkg)}
            >
              <Tr data-testid='package-row'>
                <Td
                  expand={{
                    rowIndex: rowIndex,
                    isExpanded: isPkgExpanded(pkg),
                    onToggle: () => setPkgExpanded(pkg, !isPkgExpanded(pkg)),
                    expandId: `${pkg.name}-expandable`,
                  }}
                />
                <Td
                  select={{
                    isSelected: isPackageSelected(pkg),
                    rowIndex: rowIndex,
                    onSelect: (event, isSelecting) =>
                      handleSelect(pkg, rowIndex, isSelecting),
                    isDisabled: isSelectDisabled(pkg),
                  }}
                  title={
                    isSelectDisabled(pkg)
                      ? 'Disabled due to the package(s) you selected. You cannot select packages from different application stream versions.'
                      : ''
                  }
                />
                <Td>{pkg.name}</Td>
                <Td>{pkg.stream ? pkg.stream : 'N/A'}</Td>
                <Td>
                  <RetirementDate date={pkg.end_date} />
                </Td>
              </Tr>
              <Tr isExpanded={isPkgExpanded(pkg)}>
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    {
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>
                            Description
                            {toggleSelected === 'toggle-selected' && (
                              <PackageInfoNotAvailablePopover />
                            )}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {pkg.summary ? pkg.summary : 'Not available'}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    }
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          )),
      );
    }
    return rows;
  };

  const bodyContent = useMemo(() => {
    switch (true) {
      case debouncedSearchTermLengthOf1 && !debouncedSearchTermIsGroup:
        return <TooShort />;
      case (toggleSelected === 'toggle-selected' &&
        packages.length === 0 &&
        groups.length === 0) ||
        (!debouncedSearchTerm && toggleSelected === 'toggle-available'):
        return <EmptySearch toggleSelected={toggleSelected} />;
      case (debouncedSearchTerm &&
        (isLoadingRecommendedPackages || isLoadingRecommendedGroups) &&
        activeTabKey === Repos.OTHER) ||
        (debouncedSearchTerm &&
          (isLoadingDistroPackages ||
            isLoadingCustomPackages ||
            isLoadingDistroGroups ||
            isLoadingReposInTemplate ||
            isLoadingCustomGroups) &&
          activeTabKey === Repos.INCLUDED):
        return <Searching activeTabKey={activeTabKey} />;
      case debouncedSearchTerm &&
        transformedPackages.length === 0 &&
        transformedGroups.length === 0 &&
        toggleSelected === 'toggle-available':
        return (
          <NoResultsFound
            isOnPremise={isOnPremise}
            activeTabKey={activeTabKey}
            setActiveTabKey={setActiveTabKey}
          />
        );
      case debouncedSearchTerm &&
        toggleSelected === 'toggle-selected' &&
        activeTabKey === Repos.OTHER &&
        packages.length > 0 &&
        groups.length > 0:
        return <TryLookingUnderIncluded setActiveTabKey={setActiveTabKey} />;
      default:
        return composePkgTable();
    }
    // Would need significant rewrite to fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    perPage,
    debouncedSearchTerm,
    debouncedSearchTermLengthOf1,
    debouncedSearchTermIsGroup,
    isLoadingCustomPackages,
    isLoadingDistroPackages,
    isLoadingRecommendedPackages,
    isSuccessRecommendedPackages,
    isLoadingDistroGroups,
    isLoadingCustomGroups,
    isLoadingRecommendedGroups,
    packages.length,
    groups.length,
    toggleSelected,
    activeTabKey,
    transformedPackages,
    transformedGroups,
    isSelectingPackage,
    recommendedRepositories,
    transformedPackages.length,
    transformedGroups.length,
    expandedPkgs,
    expandedGroups,
    sortedPackages,
    activeSortDirection,
    activeSortIndex,
    template,
  ]);

  const PackagesTable = () => {
    return (
      <Table variant='compact' data-testid='packages-table'>
        <Thead>
          <Tr>
            <Th aria-label='Expanded' />
            <Th aria-label='Selected' />
            <Th sort={getSortParams(0)} width={30}>
              Name
            </Th>
            <Th sort={getSortParams(2)} width={20}>
              Application stream
            </Th>
            <Th sort={getSortParams(3)} width={30}>
              Retirement date
            </Th>
          </Tr>
        </Thead>
        {bodyContent}
      </Table>
    );
  };

  return (
    <>
      <RepositoryModal
        isRepoModalOpen={isRepoModalOpen}
        setIsRepoModalOpen={setIsRepoModalOpen}
        isSelectingPackage={isSelectingPackage}
        setIsSelectingPackage={setIsSelectingPackage}
        isSelectingGroup={isSelectingGroup}
        epelRepo={epelRepo}
      />
      <Toolbar>
        <Stack>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                type='text'
                placeholder='Search packages'
                aria-label='Search packages'
                data-testid='packages-search-input'
                value={searchTerm}
                onChange={handleSearch}
                onClear={() => handleClear()}
              />
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup>
                <ToggleGroupItem
                  text='Available'
                  buttonId='toggle-available'
                  isSelected={toggleSelected === 'toggle-available'}
                  onChange={handleFilterToggleClick}
                />
                <ToggleGroupItem
                  text={`Selected${
                    packages.length + groups.length === 0
                      ? ''
                      : packages.length + groups.length <= 100
                        ? ` (${packages.length + groups.length})`
                        : ' (100+)'
                  }`}
                  buttonId='toggle-selected'
                  isSelected={toggleSelected === 'toggle-selected'}
                  onChange={handleFilterToggleClick}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem variant='pagination'>
              <Pagination
                data-testid='packages-pagination-top'
                itemCount={
                  searchTerm === '' && toggleSelected === 'toggle-available'
                    ? 0
                    : showPackages && showGroups
                      ? transformedPackages.length + transformedGroups.length
                      : showPackages
                        ? transformedPackages.length
                        : transformedGroups.length
                }
                perPage={perPage}
                page={page}
                onSetPage={handleSetPage}
                onPerPageSelect={handlePerPageSelect}
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
          <ToolbarContent>
            <CustomHelperText
              hide={!debouncedSearchTermLengthOf1 || debouncedSearchTermIsGroup}
              textValue='The search value must be greater than 1 character'
            />
          </ToolbarContent>
        </Stack>
      </Toolbar>

      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label='Repositories tabs on packages step'
      >
        <Tab
          eventKey='included-repos'
          title={<TabTitleText>Included repos</TabTitleText>}
          actions={!isOnPremise ? <IncludedReposPopover /> : undefined}
          aria-label='Included repositories'
        />
        {!isOnPremise && (
          <Tab
            eventKey='other-repos'
            title={<TabTitleText>Other repos</TabTitleText>}
            actions={<OtherReposPopover />}
            aria-label='Other repositories'
          />
        )}
      </Tabs>
      <PackagesTable />
      <Pagination
        data-testid='packages-pagination-bottom'
        itemCount={
          searchTerm === '' && toggleSelected === 'toggle-available'
            ? 0
            : showPackages && showGroups
              ? transformedPackages.length + transformedGroups.length
              : showPackages
                ? transformedPackages.length
                : transformedGroups.length
        }
        perPage={perPage}
        page={page}
        onSetPage={handleSetPage}
        onPerPageSelect={handlePerPageSelect}
        variant={PaginationVariant.bottom}
      />
    </>
  );
};

export default Packages;
