import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { HelperText, HelperTextItem, Title } from '@patternfly/react-core';

import nextStepMapper from './imageOutputStepMapper';
import StepTemplate from './stepTemplate';

import { DEFAULT_AWS_REGION } from '../../../constants';
import CustomButtons from '../formComponents/CustomButtons';

export default {
  StepTemplate,
  id: 'wizard-target-aws',
  title: 'Amazon Web Services',
  customTitle: (
    <Title headingLevel="h1" size="xl">
      Target environment - Amazon Web Services
    </Title>
  ),
  name: 'aws-target-env',
  substepOf: 'Target environment',
  nextStep: ({ values }) => nextStepMapper(values, { skipAws: true }),
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'plain-text-component',
      label: (
        <p>
          Your image will be uploaded to AWS and shared with the account you
          provide below.
        </p>
      ),
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'plain-text-component',
      label: (
        <p>
          <b>The shared image will expire within 14 days.</b> To permanently
          access the image, copy the image, which will be shared to your account
          by Red Hat, to your own AWS account.
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
    {
      component: componentTypes.TEXT_FIELD,
      name: 'aws-default-region',
      className: 'pf-u-w-25',
      'data-testid': 'aws-default-region',
      type: 'text',
      label: 'Default Region',
      value: DEFAULT_AWS_REGION,
      isReadOnly: true,
      isRequired: true,
      helperText: (
        <HelperText>
          <HelperTextItem
            component="div"
            variant="indeterminate"
            className="pf-u-w-25"
          >
            Images are built in the default region but can be copied to other
            regions later.
          </HelperTextItem>
        </HelperText>
      ),
    },
  ],
};
