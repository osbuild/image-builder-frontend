import React, { useEffect, useState } from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  Button,
  Popover,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

const PopoverActivation = () => {
  const [orgId, setOrgId] = useState(null);
  const { auth } = useChrome();

  useEffect(() => {
    (async () => {
      const userData = await auth?.getUser();
      const id = userData?.identity?.internal?.org_id;
      setOrgId(id);
    })();
  });
  return (
    <Popover
      hasAutoWidth
      maxWidth="35rem"
      bodyContent={
        <TextContent>
          <Text>
            Activation keys enable you to register a system with appropriate
            subscriptions, system purpose, and repositories attached.
          </Text>
          <Text>
            If using an activation key with command line registration, you must
            provide your organization&apos;s ID.
            {orgId && <br />}
            {orgId && "Your organization's ID is " + orgId}
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

const registrationStep = {
  StepTemplate,
  id: 'wizard-registration',
  title: 'Register',
  customTitle: (
    <Title headingLevel="h1" size="xl">
      Register systems using this image
    </Title>
  ),
  name: 'registration',
  nextStep: 'Compliance',
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'registration-general-description',
      label:
        'Automatically register your systems with Red Hat to enhance security and track your spending.',
    },
    {
      name: 'register-system',
      component: 'registration',
      label: 'Registration method',
      initialValue: 'register-now-rhc',
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
          { when: 'register-system', is: 'register-now-rhc' },
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
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          isInline
          href="https://console.redhat.com/insights/connector/activation-keys"
        >
          Create and manage activation keys here
        </Button>
      ),
      condition: {
        or: [
          { when: 'register-system', is: 'register-now-rhc' },
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
            having access to updates or Red Hat services. Registering and
            connecting your systems during the image creation is recommended.
          </Text>
          <Text>
            If you prefer to register later, review the instructions for manual
            registration with remote host configuration.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/articles/rhc"
          >
            Registering with remote host configuration
          </Button>
        </TextContent>
      ),
      condition: {
        or: [{ when: 'register-system', is: 'register-later' }],
      },
    },
    {
      component: 'activation-key-information',
      name: 'subscription-activation-key-information',
      label: 'Selected activation key',
      valueReference: 'subscription-activation-key',
      condition: {
        or: [
          { when: 'register-system', is: 'register-now-rhc' },
          { when: 'register-system', is: 'register-now-insights' },
          { when: 'register-system', is: 'register-now' },
        ],
      },
    },
  ],
};

export default registrationStep;
