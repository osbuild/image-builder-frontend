import React from 'react';

import { Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectPackages } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import Packages from './components/Packages';

const PackagesStep = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const packages = useAppSelector(selectPackages);

  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  const { packages: oscapPackages } = useSecuritySummary();
  const packageNames = new Set(packages.map((pkg) => pkg.name));
  const requiredByOpenSCAPCount = oscapPackages.filter((pkg) =>
    packageNames.has(pkg),
  ).length;

  return (
    <Wrapper>
      <CustomizationLabels customization='packages' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
          className='pf-v6-u-display-flex pf-v6-u-align-items-center'
        >
          Packages
          {requiredByOpenSCAPCount > 0 && (
            <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
              {requiredByOpenSCAPCount} Added by OpenSCAP
            </Label>
          )}
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Search and add individual packages to include in your image. You can
          select packages from the repositories included in the previous step.
        </Content>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
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
    </Wrapper>
  );
};

export default PackagesStep;
