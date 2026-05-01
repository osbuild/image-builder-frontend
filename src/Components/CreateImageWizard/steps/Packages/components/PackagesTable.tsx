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

import { useSecuritySummary } from '@/store/api/backend';
import { ApiRepositoryCollectionResponseRead } from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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
  const { packages: requiredPkgNames } = useSecuritySummary();
  const requiredSet = useMemo(
    () => new Set(requiredPkgNames),
    [requiredPkgNames],
  );

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

    return [...packages].sort((a, b) => {
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
  }, [packages, activeStream]);

  const sortedGroups = useMemo(() => {
    if (groups.length < 1 || !Array.isArray(groups)) {
      return [];
    }

    return [...groups].sort((a, b) => a.name.localeCompare(b.name));
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
                      ? { maxHeight: '40em', overflow: 'scroll' }
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

    // Render required (oscap) packages first, then user-added packages
    const orderedPackages = [
      ...sortedPackages.filter((pkg) => requiredSet.has(pkg.name)),
      ...sortedPackages.filter((pkg) => !requiredSet.has(pkg.name)),
    ];

    rows = rows.concat(
      orderedPackages.map((pkg) => {
        const isRequired = requiredSet.has(pkg.name);
        return (
          <Tbody
            key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
          >
            <Tr
              data-testid={isRequired ? 'required-package-row' : 'package-row'}
            >
              <Td>&nbsp;</Td>
              <Td>{pkg.name}</Td>
              <Td>{pkg.stream ? pkg.stream : '--'}</Td>
              <Td>
                <RetirementDate date={pkg.end_date} />
              </Td>
              <Td>
                <RemovePackageButton
                  item={pkg}
                  isRequired={isRequired}
                  onRemove={(item) =>
                    handleRemovePackage(item as IBPackageWithRepositoryInfo)
                  }
                />
              </Td>
            </Tr>
          </Tbody>
        );
      }),
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
    requiredSet,
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
