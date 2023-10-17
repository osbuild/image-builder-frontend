import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

const oscapStep = {
  StepTemplate,
  id: 'wizard-systemconfiguration-oscap',
  title: 'OpenSCAP Compliance',
  name: 'Compliance',
  nextStep: 'File system configuration',
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'oscap-text-component',
      label: (
        <Text>
          Monitor regulatory compliance profiles of registered RHEL systems you
          must adhere to via OpenSCAP.
        </Text>
      ),
    },
    {
      component: 'oscap-profile-selector',
      name: 'oscap-profile',
      label: 'Available profiles for the distribution',
    },
  ],
};

export default oscapStep;
