import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import nextStepMapper from './imageOutputStepMapper';
import { Title } from '@patternfly/react-core';
import StepTemplate from './stepTemplate';

export default {
  StepTemplate,
  id: 'wizard-target-aws',
  title: 'Amazon Web Services',
  customTitle: (
    <Title headingLevel="h1" size="xl">
      Target environment - Amazon Web Service
    </Title>
  ),
  name: 'aws-target-env',
  substepOf: 'Target environment',
  nextStep: ({ values }) => nextStepMapper(values, { skipAws: true }),
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'plain-text-component',
      label: (
        <p>
          Your image will be uploaded to AWS and shared with the account you
          provide below. <br />
          The shared image will expire within 14 days. To keep the image longer,
          copy it to your AWS account.
        </p>
      ),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'aws-account-id',
      className: 'pf-u-w-25',
      'data-testid': 'aws-account-id',
      type: 'text',
      label: 'AWS account ID',
      isRequired: true,
      autoFocus: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.EXACT_LENGTH,
          threshold: 12,
        },
      ],
    },
  ],
};
