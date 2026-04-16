import React from 'react';

import { Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  selectComplianceProfileID,
  selectDistribution,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';
import isRhel from '@/Utilities/isRhel';
import { useFlag } from '@/Utilities/useGetEnvironment';

import PackageRecommendations from './components/PackageRecommendations';
import Packages from './components/Packages';

const PackagesStep = () => {
  const distribution = useAppSelector(selectDistribution);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: asDistribution(release),
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const requiredByOpenSCAPCount =
    oscapProfileInfo?.packages?.filter(Boolean).length ?? 0;

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
      {!isOnPremise && isRhel(distribution) && <PackageRecommendations />}
    </Wrapper>
  );
};

export default PackagesStep;
