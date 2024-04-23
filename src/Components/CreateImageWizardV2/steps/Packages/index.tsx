import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';
import { useFlag } from '@unleash/proxy-client-react';

import PackageRecommendations from './PackageRecommendations';
import Packages from './Packages';

import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

const PackagesStep = () => {
  const { isBeta } = useGetEnvironment();
  const packageRecommendationsFlag = useFlag('image-builder.pkgrecs.enabled');
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Additional packages
      </Title>
      <Text>Blueprints created with Images include all required packages.</Text>
      <Packages />
      {isBeta() && packageRecommendationsFlag && <PackageRecommendations />}
    </Form>
  );
};

export default PackagesStep;
