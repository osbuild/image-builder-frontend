import React, { ReactElement, useMemo, useState } from 'react';

import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppSelector } from '@/store/hooks';
import { selectPackageGroups, selectPackages } from '@/store/slices/wizard';

import EmptySearch from './EmptySearch';
import GroupRow from './GroupRow';
import PackageRow from './PackageRow';

import {
  useRemovePackageContent,
  useRequiredPackages,
} from '../packagesUtilities';

const PackagesTable = () => {
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const requiredSet = useRequiredPackages();

  const { handleRemovePackage, handleRemoveGroup } = useRemovePackageContent();

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

  const composePkgTable = () => {
    let rows: ReactElement[] = [];

    rows = rows.concat(
      groups.map((grp, rowIndex) => (
        <GroupRow
          key={`${grp.name}-${grp.repository || 'default'}`}
          group={grp}
          rowIndex={rowIndex}
          isExpanded={isGroupExpanded(grp.name)}
          onToggle={() =>
            setGroupsExpanded(grp.name, !isGroupExpanded(grp.name))
          }
          onRemove={handleRemoveGroup}
        />
      )),
    );

    // Render required (oscap) packages first, then user-added packages
    const orderedPackages = [
      ...packages.filter((pkg) => requiredSet.has(pkg.name)),
      ...packages.filter((pkg) => !requiredSet.has(pkg.name)),
    ];

    rows = rows.concat(
      orderedPackages.map((pkg) => (
        <PackageRow
          key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
          pkg={pkg}
          isRequired={requiredSet.has(pkg.name)}
          onRemove={handleRemovePackage}
        />
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
  }, [packages, groups, expandedGroups, requiredSet]);

  return (
    <Table data-testid='packages-table' style={{ tableLayout: 'fixed' }}>
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
