import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Text } from '@patternfly/react-core';

import nextStepMapper from './imageOutputStepMapper';
import StepTemplate from './stepTemplate';

import { RHEL_9, X86_64 } from '../../../constants.js';
import DocumentationButton from '../../sharedComponents/DocumentationButton';
import CustomButtons from '../formComponents/CustomButtons';

const imageOutputStep = {
  StepTemplate,
  id: 'wizard-imageoutput',
  title: 'Image output',
  name: 'image-output',
  nextStep: ({ values }) => nextStepMapper(values),
  buttons: CustomButtons,
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
      component: 'image-output-release-lifecycle',
      label: 'Release lifecycle',
      name: 'release-lifecycle',
    },
    {
      component: 'image-output-arch-select',
      label: 'Architecture',
      name: 'arch',
      initialValue: X86_64,
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
        then: { set: { 'register-system': null } },
        else: { visible: false },
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

export default imageOutputStep;
