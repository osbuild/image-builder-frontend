import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import PackageRecommendations from './PackageRecommendations';
import Packages from './Packages';

import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import isRhel from '../../../../Utilities/isRhel';

const PackagesStep = () => {
  const distribution = useAppSelector(selectDistribution);
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Additional packages
      </Title>
      <Content>
        Blueprints created with Images include all required packages.
      </Content>
      <Packages />
      {isRhel(distribution) && <PackageRecommendations />}
    </Form>
  );
};

export default PackagesStep;
