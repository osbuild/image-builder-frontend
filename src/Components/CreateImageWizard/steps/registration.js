import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  Button,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import StepTemplate from './stepTemplate';

const PopoverActivation = () => {
  return (
    <Popover
      hasAutoWidth
      maxWidth="35rem"
      bodyContent={
        <TextContent>
          <Text>
            Activation keys allow you to register a system with appropriate
            subscriptions and system purpose attached.
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Activation key popover"
        aria-describedby="subscription-activation-key"
        className="pf-c-form__group-label-help"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export default {
  StepTemplate,
  id: 'wizard-registration',
  title: 'Registration',
  name: 'registration',
  nextStep: 'File system configuration',
  fields: [
    {
      component: componentTypes.RADIO,
      label: 'Register images with Red Hat',
      name: 'register-system',
      initialValue: 'register-now-insights',
      options: [
        {
          label: 'Register and connect image instances with Red Hat',
          description: 'Includes Subscriptions and Red Hat Insights',
          value: 'register-now-insights',
          'data-testid': 'radio-register-now-insights',
          autoFocus: true,
        },
        {
          label: 'Register image instances only',
          description: 'Includes Subscriptions only',
          value: 'register-now',
          className: 'pf-u-mt-sm',
          'data-testid': 'radio-register-now',
        },
        {
          label: 'Register later',
          value: 'register-later',
          className: 'pf-u-mt-sm',
          'data-testid': 'radio-register-later',
        },
      ],
    },
    {
      component: 'activation-keys',
      name: 'subscription-activation-key',
      required: true,
      label: (
        <>
          Activation key to use for this image
          <PopoverActivation />
        </>
      ),
      condition: {
        or: [
          { when: 'register-system', is: 'register-now-insights' },
          { when: 'register-system', is: 'register-now' },
        ],
      },
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
      ],
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'subscription-activation-description',
      label: (
        <>
          Create and manage activation keys in the&nbsp;
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/"
          >
            Customer Portal
          </Button>
        </>
      ),
      condition: {
        or: [
          { when: 'register-system', is: 'register-now-insights' },
          { when: 'register-system', is: 'register-now' },
        ],
      },
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'subscription-register-later',
      label: (
        <TextContent>
          <Text component={TextVariants.h3}>Register Later</Text>
          <Text>
            On initial boot, systems will need to be registered manually before
            having access to updates or Red Hat services.
          </Text>
          <Text>Registering now is recommended.</Text>
        </TextContent>
      ),
      condition: {
        or: [{ when: 'register-system', is: 'register-later' }],
      },
    },
  ],
};
