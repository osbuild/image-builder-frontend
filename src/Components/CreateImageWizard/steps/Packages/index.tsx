import React from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';

import PackageRecommendations from './PackageRecommendations';
import Packages from './Packages';

import { useIsOnPremise } from '../../../../Hooks';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import isRhel from '../../../../Utilities/isRhel';

const PackagesStep = () => {
  const distribution = useAppSelector(selectDistribution);
  const isOnPremise = useIsOnPremise();
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Additional packages
      </Title>
      <Content>
        Blueprints created with Images include all required packages.
      </Content>
      {!isOnPremise && (
        <Alert variant='info' isInline title='Search for package groups'>
          Search for package groups by starting your search with the
          &apos;@&apos; character. A single &apos;@&apos; as search input lists
          all available package groups.
        </Alert>
      )}
      {isOnPremise && (
        <Alert variant='info' isInline title='Searching for packages'>
          Search for exact matches by specifying the whole package name, or glob
          using asterisk wildcards (*) before or after the package name.
        </Alert>
      )}
      <Packages />
      {isRhel(distribution) && <PackageRecommendations />}
    </Form>
  );
};

export default PackagesStep;
