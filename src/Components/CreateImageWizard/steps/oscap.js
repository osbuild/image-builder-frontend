import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text, Title } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import DocumentationButton from '../../sharedComponents/DocumentationButton';
import CustomButtons from '../formComponents/CustomButtons';

const oscapStep = {
  StepTemplate,
  id: 'wizard-systemconfiguration-oscap',
  title: 'OpenSCAP',
  name: 'Compliance',
  customTitle: (
    <Title headingLevel="h1" size="xl">
      OpenSCAP profile
    </Title>
  ),
  nextStep: 'File system configuration',
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'oscap-text-component',
      label: (
        <Text>
          Use OpenSCAP to monitor the adherence of your registered RHEL systems
          to a selected regulatory compliance profile. <DocumentationButton />
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
