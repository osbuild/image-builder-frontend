import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useMemo,
  useState,
} from 'react';

import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
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

import EmptySearch from './EmptySearch';
import NoResultsFound from './NoResultsFound';
import PackageInfoNotAvailablePopover from './PackageInfoNotAvailablePopover';
import RetirementDate from './RetirementDate';
import Searching from './Searching';
import TooShort from './TooShort';
import TryLookingUnderIncluded from './TryLookingUnderIncluded';

import { ApiRepositoryCollectionResponseRead } from '../../../../../store/contentSourcesApi';
import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { Module } from '../../../../../store/imageBuilderApi';
import {
  addModule,
  addPackage,
  addPackageGroup,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectRecommendedRepositories,
} from '../../../../../store/wizardSlice';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  Repos,
} from '../packagesTypes';
import { getPackageUniqueKey } from '../packagesUtilities';

type PackagesTableProps = {
  isSuccessEpelRepo: boolean;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
  setIsRepoModalOpen: (value: boolean) => void;
  setIsSelectingPackage: (
    value: IBPackageWithRepositoryInfo | undefined,
  ) => void;
  setActiveStream: (value: string) => void;
  setCurrentlyRemovedPackages: Dispatch<
    SetStateAction<IBPackageWithRepositoryInfo[]>
  >;
  packages: IBPackageWithRepositoryInfo[];
  groups: GroupWithRepositoryInfo[];
  modules: Module[];
  setIsSelectingGroup: (value: GroupWithRepositoryInfo | undefined) => void;
  activeSortIndex: number;
  setActiveSortIndex: (value: number) => void;
  activeSortDirection: 'asc' | 'desc';
  setActiveSortDirection: (value: 'asc' | 'desc') => void;
  transformedPackages: IBPackageWithRepositoryInfo[];
  activeStream: string;
  perPage: number;
  page: number;
  showGroups: boolean;
  showPackages: boolean;
  transformedGroups: GroupWithRepositoryInfo[];
  toggleSelected: string;
  isLoadingRecommendedPackages: boolean;
  isLoadingDistroPackages: boolean;
  isLoadingCustomPackages: boolean;
  isLoadingRecommendedGroups: boolean;
  isLoadingDistroGroups: boolean;
  isLoadingCustomGroups: boolean;
  isLoadingReposInTemplate: boolean;
  isSuccessRecommendedPackages: boolean;
  isSelectingPackage: IBPackageWithRepositoryInfo | undefined;
  debouncedSearchTerm: string;
  debouncedSearchTermLengthOf1: boolean;
  debouncedSearchTermIsGroup: boolean;
  activeTabKey: Repos;
  setActiveTabKey: (value: Repos) => void;
  template: string;
};

const PackagesTable = ({
  isSuccessEpelRepo,
  epelRepo,
  setIsRepoModalOpen,
  setIsSelectingPackage,
  setActiveStream,
  setCurrentlyRemovedPackages,
  packages,
  groups,
  modules,
  setIsSelectingGroup,
  activeSortIndex,
  setActiveSortIndex,
  activeSortDirection,
  setActiveSortDirection,
  transformedPackages,
  activeStream,
  perPage,
  page,
  showGroups,
  showPackages,
  transformedGroups,
  toggleSelected,
  isLoadingRecommendedPackages,
  isLoadingDistroPackages,
  isLoadingCustomPackages,
  isLoadingRecommendedGroups,
  isLoadingDistroGroups,
  isLoadingCustomGroups,
  isLoadingReposInTemplate,
  isSuccessRecommendedPackages,
  isSelectingPackage,
  debouncedSearchTerm,
  debouncedSearchTermLengthOf1,
  debouncedSearchTermIsGroup,
  activeTabKey,
  setActiveTabKey,
  template,
}: PackagesTableProps) => {
  const dispatch = useDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const handleSelect = (
    pkg: IBPackageWithRepositoryInfo,
    _: number,
    isSelecting: boolean,
  ) => {
    if (isSelecting) {
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
        epelRepo &&
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
        groups.filter((grp) => grp.repository === 'recommended').length === 1 &&
        packages.filter((pkg) => pkg.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

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

export default PackagesTable;
