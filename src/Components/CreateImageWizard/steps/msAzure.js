import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Title, Text } from '@patternfly/react-core';
import nextStepMapper from './imageOutputStepMapper';
import StepTemplate from './stepTemplate';

export default {
  StepTemplate,
  id: 'wizard-target-msazure',
  title: 'Microsoft Azure',
  customTitle: (
    <Title headingLevel="h1" size="xl">
      Target environment - Microsoft Azure
    </Title>
  ),
  name: 'ms-azure-target-env',
  substepOf: 'Target environment',
  nextStep: ({ values }) =>
    nextStepMapper(values, {
      skipAws: true,
      skipGoogle: true,
      skipAzure: true,
    }),
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'azure-description',
      label: (
        <Text>
          Image Builder sends an image to an authorized Azure account.
        </Text>
      ),
    },
    {
      component: 'azure-auth-expandable',
      name: 'azure-auth-expandable',
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'azure-destination',
      label: (
        <>
          <Title headingLevel="h2">Destination</Title>
          <Text>
            Your image will be uploaded to the resource group in the
            subscription you specify.
          </Text>
        </>
      ),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'azure-tenant-id',
      className: 'pf-u-w-50',
      'data-testid': 'azure-tenant-id',
      type: 'text',
      label: 'Tenant ID',
      required: true,
      isRequired: true,
      autoFocus: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.PATTERN,
          pattern:
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          message: 'Please enter a valid tenant ID',
        },
      ],
    },
    {
      component: 'azure-auth-button',
      name: 'azure-auth-button',
      'data-testid': 'azure-auth-button',
      required: true,
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'azure-subscription-id',
      className: 'pf-u-w-50',
      'data-testid': 'azure-subscription-id',
      type: 'text',
      label: 'Subscription ID',
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.PATTERN,
          pattern:
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          message: 'Please enter a valid subscription ID',
        },
      ],
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'azure-resource-group',
      className: 'pf-u-w-50',
      'data-testid': 'azure-resource-group',
      type: 'text',
      label: 'Resource group',
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.PATTERN,
          pattern: /^[-\w._()]+[-\w_()]$/,
          message:
            'Resource group names only allow alphanumeric characters, ' +
            'periods, underscores, hyphens, and parenthesis and cannot end in a period',
        },
      ],
    },
    // TODO check oauth2 thing too here?
  ],
};
