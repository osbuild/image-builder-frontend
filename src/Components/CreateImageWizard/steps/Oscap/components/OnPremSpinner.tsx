import React from 'react';

import { Form, FormGroup, Spinner, Title } from '@patternfly/react-core';

const OscapOnPremSpinner = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Security
      </Title>
      <FormGroup>
        <Spinner size='xl' />
      </FormGroup>
    </Form>
  );
};

export default OscapOnPremSpinner;
