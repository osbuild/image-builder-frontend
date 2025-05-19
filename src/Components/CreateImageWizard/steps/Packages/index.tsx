import React from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';

import PackageRecommendations from './PackageRecommendations';
import Packages from './Packages';

import { RHEL_8, RHEL_9 } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';

const PackagesStep = () => {
  const distribution = useAppSelector(selectDistribution);
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Additional packages
      </Title>
      <Content component="p">
        Blueprints created with Images include all required packages.
      </Content>
      {!process.env.IS_ON_PREMISE && (
        <Alert variant="info" isInline title="Search for package groups">
          Search for package groups by starting your search with the
          &apos;@&apos; character. A single &apos;@&apos; as search input lists
          all available package groups.
        </Alert>
      )}
      {process.env.IS_ON_PREMISE && (
        <Alert variant="info" isInline title="Searching for packages">
          Search for exact matches by specifying the whole package name, or glob
          using asterisk wildcards (*) before or after the package name.
        </Alert>
      )}
      <Packages />
      {(distribution === RHEL_8 || distribution === RHEL_9) && (
        <PackageRecommendations />
      )}
    </Form>
  );
};

export default PackagesStep;
