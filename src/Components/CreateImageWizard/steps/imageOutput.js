import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import nextStepMapper from './imageOutputStepMapper';
import { RHEL_9 } from '../../../constants.js';
import { Text } from '@patternfly/react-core';
import DocumentationButton from '../../sharedComponents/DocumentationButton';
import StepTemplate from './stepTemplate';

export default {
  StepTemplate,
  id: 'wizard-imageoutput',
  title: 'Image output',
  name: 'image-output',
  nextStep: ({ values }) => nextStepMapper(values),
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'image-output-plain-text',
      label: (
        <Text>
          Image builder allows you to create a custom image and push it to
          target environments.
          <br />
          <DocumentationButton />
        </Text>
      ),
    },
    {
      component: 'image-output-release-select',
      label: 'Release',
      name: 'release',
      initialValue: RHEL_9,
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
      ],
    },
    {
      component: 'centos-acknowledgement',
      name: 'centos-acknowledgement',
      condition: {
        when: 'release',
        pattern: /centos-*/,
      },
    },
    {
      component: 'output',
      name: 'target-environment',
      label: 'Select target environments',
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: 'targetEnvironmentValidator',
        },
      ],
    },
  ],
};
