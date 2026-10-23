import React from 'react';

import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppSelector } from '@/store/hooks';
import { selectPackageGroups, selectPackages } from '@/store/slices/wizard';

import EmptySearch from './EmptySearch';
import GroupRow from './GroupRow';
import PackageRow from './PackageRow';

import { useRequiredPackages } from '../packagesUtilities';

const PackagesTable = () => {
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const requiredSet = useRequiredPackages();

  const orderedPackages = [
    ...packages.filter((pkg) => requiredSet.has(pkg.name)),
    ...packages.filter((pkg) => !requiredSet.has(pkg.name)),
  ];

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
      {packages.length === 0 && groups.length === 0 ? (
        <EmptySearch />
      ) : (
        <>
          {groups.map((group, index) => (
            <GroupRow
              key={`${group.name}-${group.repository || 'default'}`}
              group={group}
              rowIndex={index}
            />
          ))}
          {orderedPackages.map((pkg) => (
            <PackageRow
              key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
              pkg={pkg}
              isRequired={requiredSet.has(pkg.name)}
            />
          ))}
        </>
      )}
    </Table>
  );
};

export default PackagesTable;
