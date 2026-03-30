import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { selectIsOnPremise } from '@/store/slices/env';
import { selectDistribution } from '@/store/slices/wizard';

import PackageRecommendations from './components/PackageRecommendations';
import Packages from './components/Packages';

import { useAppSelector } from '../../../../store/hooks';
import isRhel from '../../../../Utilities/isRhel';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const PackagesStep = () => {
  const distribution = useAppSelector(selectDistribution);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  return (
    <Form>
      <CustomizationLabels customization='packages' />
      <Title headingLevel='h1' size='xl'>
        Packages
      </Title>
      <Content>
        Search and add individual packages to include in your image. You can
        select packages from the repositories included in the previous step.
      </Content>
      <Content>
        {isOnPremise && (
          <>
            Search for exact matches by specifying the whole package name, or
            glob using asterisk wildcards (*) before or after the package name.
          </>
        )}
      </Content>
      <Packages />
      {!isOnPremise && isRhel(distribution) && <PackageRecommendations />}
    </Form>
  );
};

export default PackagesStep;
