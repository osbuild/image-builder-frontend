import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import DocumentationButton from '../../../sharedComponents/DocumentationButton';

const ImageOutputStep = () => {
  return (
    <Form>
      <Title headingLevel="h2">Image output</Title>
      <Text>
        Image builder allows you to create a custom image and push it to target
        environments.
        <br />
        <DocumentationButton />
      </Text>
    </Form>
  );
};

export default ImageOutputStep;
