import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

export default {
  StepTemplate,
  id: 'wizard-systemconfiguration-packages',
  title: 'Additional Red Hat packages',
  name: 'packages',
  substepOf: 'Content',
  nextStep: ({ values }) => {
    if (values.isBeta) {
      return 'repositories';
    } else {
      return 'image-name';
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
