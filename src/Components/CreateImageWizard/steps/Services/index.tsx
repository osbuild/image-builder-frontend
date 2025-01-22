import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

const ServicesStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Systemd services
      </Title>
      <Text>Enable and disable systemd services.</Text>
    </Form>
  );
};

export default ServicesStep;
