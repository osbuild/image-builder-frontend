import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  Button,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import nextStepMapper from './imageOutputStepMapper';
import StepTemplate from './stepTemplate';

import { DEFAULT_AWS_REGION } from '../../../constants';
import CustomButtons from '../formComponents/CustomButtons';

const SourcesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={'settings/sources'}
    >
      Create and manage sources here
    </Button>
  );
};

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
      component: componentTypes.RADIO,
      label: 'Share method:',
      name: 'aws-target-type',
      initialValue: 'aws-target-type-source',
      autoFocus: true,
      options: [
        {
          label: 'Use an account configured from Sources.',
          description:
            'Use a configured source to launch environments directly from the console.',
          value: 'aws-target-type-source',
          'data-testid': 'aws-radio-source',
          autoFocus: true,
        },
        {
          label: 'Manually enter an account ID.',
          value: 'aws-target-type-account-id',
          'data-testid': 'aws-radio-account-id',
          className: 'pf-u-mt-sm',
        },
      ],
    },
    {
      component: 'aws-sources-select',
      name: 'aws-sources-select',
      className: 'pf-u-max-width',
      label: 'Source Name',
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
      ],
      condition: {
        when: 'aws-target-type',
        is: 'aws-target-type-source',
      },
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'aws-sources-select-description',
      label: <SourcesButton />,
      condition: {
        when: 'aws-target-type',
        is: 'aws-target-type-source',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'aws-account-id',
      className: 'pf-u-w-25',
      'data-testid': 'aws-account-id',
      type: 'text',
      label: 'AWS account ID',
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.EXACT_LENGTH,
          threshold: 12,
        },
      ],
      condition: {
        when: 'aws-target-type',
        is: 'aws-target-type-account-id',
      },
    },
    {
      name: 'gallery-layout',
      component: 'gallery-layout',
      minWidths: { default: '12.5rem' },
      maxWidths: { default: '12.5rem' },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'aws-default-region',
          value: DEFAULT_AWS_REGION,
          'data-testid': 'aws-default-region',
          type: 'text',
          label: 'Default Region',
          isReadOnly: true,
          isRequired: true,
          helperText: (
            <HelperText>
              <HelperTextItem component="div" variant="indeterminate">
                Images are built in the default region but can be copied to
                other regions later.
              </HelperTextItem>
            </HelperText>
          ),
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'aws-associated-account-id',
          'data-testid': 'aws-associated-account-id',
          type: 'text',
          label: 'Associated Account ID',
          isReadOnly: true,
          isRequired: true,
          helperText: (
            <HelperText>
              <HelperTextItem component="div" variant="indeterminate">
                This is the account associated with the source.
              </HelperTextItem>
            </HelperText>
          ),
          condition: {
            when: 'aws-target-type',
            is: 'aws-target-type-source',
          },
        },
        {
          component: 'field-listener',
          name: 'aws-associated-account-id-listener',
          hideField: true,
        },
      ],
    },
  ],
};
