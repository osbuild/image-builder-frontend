import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import AddedByLabel from '@/Components/sharedComponents/AddedByLabel';
import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectComplianceType, selectPackages } from '@/store/slices/wizard';

import Packages from './components/Packages';

const PackagesStep = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const complianceType = useAppSelector(selectComplianceType);
  const packages = useAppSelector(selectPackages);

  const { packages: oscapPackages } = useSecuritySummary();
  const packageNames = new Set(packages.map((pkg) => pkg.name));
  const requiredByOpenSCAPCount = oscapPackages.filter((pkg) =>
    packageNames.has(pkg),
  ).length;

  return (
    <>
      <CustomizationLabels customization='packages' />
      <Content>
        <Title
          headingLevel='h2'
          size='lg'
          className='pf-v6-u-display-flex pf-v6-u-align-items-center'
        >
          Packages
          <AddedByLabel
            count={requiredByOpenSCAPCount}
            complianceType={complianceType}
          />
        </Title>
        <Content component='small'>
          Search and add individual packages to include in your image. You can
          select packages from the repositories included in the previous step.
        </Content>
        <Content component='small'>
          {isOnPremise && (
            <>
              Search for exact matches by specifying the whole package name, or
              glob using asterisk wildcards (*) before or after the package
              name.
            </>
          )}
        </Content>
        <Packages />
      </Content>
    </>
  );
};

export default PackagesStep;
