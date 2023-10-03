import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

export const reinitPackagesStep = (change) => {
  change('selected-packages', undefined);
};

const packagesStep = {
  StepTemplate,
  id: 'wizard-systemconfiguration-packages',
  title: 'Additional Red Hat packages',
  name: 'packages',
  substepOf: 'Content',
  nextStep: ({ values }) => {
    if (values.contentSourcesEnabled) {
      return 'repositories';
    } else {
      return 'details';
    }
  },
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'packages-text-component',
      label: (
        <Text>
          Images built with Image Builder include all required packages.
        </Text>
      ),
    },
    {
      component: 'package-selector',
      name: 'selected-packages',
      label: 'Available options',
    },
  ],
};

export default packagesStep;
