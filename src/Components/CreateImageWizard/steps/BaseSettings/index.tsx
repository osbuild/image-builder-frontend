import React from 'react';

import { Form } from '@patternfly/react-core';

import ImageDetails from './components/ImageDetails';
import ImageOutput from './components/ImageOutput';

const BaseSettingsStep = () => {
  return (
    <Form>
      <ImageDetails />
      <ImageOutput />
    </Form>
  );
};

export default BaseSettingsStep;
