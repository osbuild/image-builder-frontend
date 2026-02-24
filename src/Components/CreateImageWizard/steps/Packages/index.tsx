import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import PackageRecommendations from './components/PackageRecommendations';
import Packages from './components/Packages';

import { selectIsOnPremise } from '../../../../store/envSlice';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import isRhel from '../../../../Utilities/isRhel';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const PackagesStep = () => {
  const distribution = useAppSelector(selectDistribution);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  return (
    <Form>
      <CustomizationLabels customization='packages' />
      <Title headingLevel='h1' size='xl'>
        Additional packages
      </Title>
      <Content>
        Blueprints created with Images include all required packages.
      </Content>
      <Content>
        {isOnPremise ? (
          <>
            Search for exact matches by specifying the whole package name, or
            glob using asterisk wildcards (*) before or after the package name.
          </>
        ) : (
          <>
            Search for package groups by starting your search with the
            &apos;@&apos; character. A single &apos;@&apos; as search input
            lists all available package groups.
          </>
        )}
      </Content>
      <Packages />
      {isRhel(distribution) && <PackageRecommendations />}
    </Form>
  );
};

export default PackagesStep;
