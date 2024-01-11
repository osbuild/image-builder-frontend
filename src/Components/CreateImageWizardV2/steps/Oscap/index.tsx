import React from 'react';

import { Form, Text, Title } from '@patternfly/react-core';

import { Oscap } from './Oscap';

import DocumentationButton from '../../../sharedComponents/DocumentationButton';

const OscapStep = () => {
  return (
    <Form>
      <Title headingLevel="h2">OpenSCAP profile</Title>
      <Text>
        Use OpenSCAP to monitor the adherence of your registered RHEL systems to
        a selected regulatory compliance profile
        <br />
        <DocumentationButton />
      </Text>
      <Oscap />
    </Form>
  );
};

export default OscapStep;
