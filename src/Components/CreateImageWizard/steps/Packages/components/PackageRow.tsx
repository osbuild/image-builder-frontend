import React from 'react';

import { Label } from '@patternfly/react-core';
import { Tbody, Td, Tr } from '@patternfly/react-table';

import { IBPackageWithRepositoryInfo } from '@/store/slices/wizard';

import RemovePackageButton from './RemovePackageButton';
import RetirementDate from './RetirementDate';

import { useRequiredPackages } from '../packagesUtilities';

type PackageRowProps = {
  pkg: IBPackageWithRepositoryInfo;
};

const PackageRow = ({ pkg }: PackageRowProps) => {
  const isRequired = useRequiredPackages().has(pkg.name);

  return (
    <Tbody>
      <Tr data-testid={isRequired ? 'required-package-row' : 'package-row'}>
        <Td>&nbsp;</Td>
        <Td>
          {pkg.name} {isRequired && <Label isCompact>Required</Label>}
        </Td>
        <Td>{pkg.stream ? pkg.stream : '--'}</Td>
        <Td>
          <RetirementDate date={pkg.end_date} />
        </Td>
        <Td>
          <RemovePackageButton item={pkg} />
        </Td>
      </Tr>
    </Tbody>
  );
};

export default PackageRow;
