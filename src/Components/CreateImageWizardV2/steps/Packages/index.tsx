import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import Packages from './Packages';

const PackagesStep = () => {
  return (
    <Form>
      <Title headingLevel="h2">Additional packages</Title>
      <Text>
        Images built with Image Builder include all required packages.
      </Text>
      <Packages />
    </Form>
  );
};

export default PackagesStep;
