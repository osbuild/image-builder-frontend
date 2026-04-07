import React, { ReactElement, useMemo, useState } from 'react';

import { Content } from '@patternfly/react-core';
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

import { ApiRepositoryCollectionResponseRead } from '@/store/api/contentSources';
import {
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectGroups,
  selectPackages,
  selectRecommendedRepositories,
} from '@/store/slices/wizard';

import EmptySearch from './EmptySearch';
import RemovePackageButton from './RemovePackageButton';
import RetirementDate from './RetirementDate';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

type PackagesTableProps = {
  isSuccessEpelRepo: boolean;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
  activeStream: string;
};

const PackagesTable = ({
  isSuccessEpelRepo,
  epelRepo,
  activeStream,
}: PackagesTableProps) => {
  const dispatch = useAppDispatch();
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const isGroupExpanded = (name: string) => expandedGroups.has(name);

  const setGroupsExpanded = (name: string, isExpanding: boolean) => {
    const newSet = new Set(expandedGroups);
    if (isExpanding) {
      newSet.add(name);
    } else {
      newSet.delete(name);
    }
    setExpandedGroups(newSet);
  };

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
            <Td>@{grp.name}</Td>
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
              </ExpandableRowContent>
            </Td>
          </Tr>
        </Tbody>
      )),
    );

    rows = rows.concat(
      sortedPackages.map((pkg) => (
        <Tbody
          key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
        >
          <Tr data-testid='package-row'>
            <Td>&nbsp;</Td>
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
    expandedGroups,
    sortedPackages,
    sortedGroups,
  ]);

  return (
    <Table data-testid='packages-table'>
      <Thead>
        <Tr>
          <Th width={10} aria-label='Expanded' />
          <Th width={40}>Name</Th>
          <Th width={25}>Application stream</Th>
          <Th width={25}>Retirement date</Th>
          <Th aria-label='Remove package' />
        </Tr>
      </Thead>
      {bodyContent}
    </Table>
  );
};

export default PackagesTable;
