import React from 'react';

import { Form } from '@patternfly/react-core';

import ComplianceSection from './components/ComplianceSection';
import ImageDetails from './components/ImageDetails';
import ImageOutput from './components/ImageOutput';
import RegisterSection from './components/RegisterSection';
import RepeatableBuildSection from './components/RepeatableBuildSection';

const BaseSettingsStep = () => {
  return (
    <Form>
      <ImageDetails />
      <ImageOutput />
      <RegisterSection />
      <RepeatableBuildSection />
      <ComplianceSection />
    </Form>
  );
};

export default BaseSettingsStep;
