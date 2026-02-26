import React from 'react';

import { Form } from '@patternfly/react-core';

import ImageDetails from './components/ImageDetails';

const BaseSettingsStep = () => {
  return (
    <Form>
      <ImageDetails />
    </Form>
  );
};

export default BaseSettingsStep;
