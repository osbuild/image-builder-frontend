import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

const PackagesStep = () => {
  return (
    <Form>
      <Title headingLevel="h2">Additional packages</Title>
      <Text>
        Images built with Image Builder include all required packages.
      </Text>
    </Form>
  );
};

export default PackagesStep;
