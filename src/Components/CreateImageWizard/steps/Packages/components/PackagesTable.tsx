import React, { ReactElement, useMemo, useState } from 'react';

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

import { ApiRepositoryCollectionResponseRead } from '@/store/api/contentSources';
import {
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectRecommendedRepositories,
} from '@/store/slices/wizard';

import EmptySearch from './EmptySearch';
import PackageInfoNotAvailablePopover from './PackageInfoNotAvailablePopover';
import RemovePackageButton from './RemovePackageButton';
import RetirementDate from './RetirementDate';

import { useAppSelector } from '../../../../../store/hooks';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';
import { getPackageUniqueKey } from '../packagesUtilities';

type PackagesTableProps = {
  isSuccessEpelRepo: boolean;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
  packages: IBPackageWithRepositoryInfo[];
  groups: GroupWithRepositoryInfo[];
  activeStream: string;
};

const PackagesTable = ({
  isSuccessEpelRepo,
  epelRepo,
  packages,
  groups,
  activeStream,
}: PackagesTableProps) => {
  const dispatch = useDispatch();
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const handleRemovePackage = (pkg: IBPackageWithRepositoryInfo) => {
    dispatch(removePackage(pkg.name));
    if (pkg.type === 'module' && pkg.module_name) {
      dispatch(removeModule(pkg.module_name));
    }
    if (
      isSuccessEpelRepo &&
      epelRepo &&
      epelRepo.data &&
      packages.filter((p) => p.repository === 'recommended').length === 1 &&
      groups.filter((grp) => grp.repository === 'recommended').length === 0
    ) {
      dispatch(removeRecommendedRepository(epelRepo.data[0]));
    }
  };

  const handleRemoveGroup = (grp: GroupWithRepositoryInfo) => {
    dispatch(removePackageGroup(grp.name));
    if (
      isSuccessEpelRepo &&
      epelRepo &&
      epelRepo.data &&
      groups.filter((g) => g.repository === 'recommended').length === 1 &&
      packages.filter((pkg) => pkg.repository === 'recommended').length === 0
    ) {
      dispatch(removeRecommendedRepository(epelRepo.data[0]));
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

  const sortedPackages = useMemo(() => {
    if (packages.length < 1 || !Array.isArray(packages)) {
      return [];
    }

    return orderBy(
      packages,
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
  }, [packages, activeStream]);

  const sortedGroups = useMemo(() => {
    if (groups.length < 1 || !Array.isArray(groups)) {
      return [];
    }

    return orderBy(groups, ['name'], ['asc']);
  }, [groups]);

  const composePkgTable = () => {
    let rows: ReactElement[] = [];

    rows = rows.concat(
      sortedGroups.map((grp, rowIndex) => (
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
            <Td>
              <RemovePackageButton
                item={grp}
                onRemove={(item) =>
                  handleRemoveGroup(item as GroupWithRepositoryInfo)
                }
              />
            </Td>
          </Tr>
          <Tr isExpanded={isGroupExpanded(grp.name)}>
            <Td colSpan={5}>
              <ExpandableRowContent>
                {
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>
                        Description
                        <PackageInfoNotAvailablePopover />
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {grp.description ? grp.description : 'Not available'}
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

    rows = rows.concat(
      sortedPackages.map((pkg, rowIndex) => (
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
            <Td>{pkg.name}</Td>
            <Td>{pkg.stream ? pkg.stream : 'N/A'}</Td>
            <Td>
              <RetirementDate date={pkg.end_date} />
            </Td>
            <Td>
              <RemovePackageButton
                item={pkg}
                onRemove={(item) =>
                  handleRemovePackage(item as IBPackageWithRepositoryInfo)
                }
              />
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
                        <PackageInfoNotAvailablePopover />
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
    return rows;
  };

  const bodyContent = useMemo(() => {
    if (packages.length === 0 && groups.length === 0) {
      return <EmptySearch />;
    }
    return composePkgTable();
    // Would need significant rewrite to fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    packages.length,
    groups.length,
    recommendedRepositories,
    expandedPkgs,
    expandedGroups,
    sortedPackages,
    sortedGroups,
  ]);

  return (
    <Table variant='compact' data-testid='packages-table'>
      <Thead>
        <Tr>
          <Th aria-label='Expanded' />
          <Th width={30}>Name</Th>
          <Th width={20}>Application stream</Th>
          <Th width={30}>Retirement date</Th>
          <Th aria-label='Remove package' />
        </Tr>
      </Thead>
      {bodyContent}
    </Table>
  );
};

export default PackagesTable;
