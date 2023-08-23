import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

const packagesContentSourcesStep = {
  StepTemplate,
  id: 'wizard-systemconfiguration-content-sources-packages',
  title: 'Additional custom packages',
  name: 'packages-content-sources',
  substepOf: 'Content',
  nextStep: 'details',
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'packages-text-component',
      label: (
        <Text>
          The available packages will return results from all repositories
          chosen on the previous page.
        </Text>
      ),
    },
    {
      component: 'package-selector-content-sources',
      name: 'selected-packages-content-sources',
      label: 'Available options',
    },
  ],
};

export default packagesContentSourcesStep;
