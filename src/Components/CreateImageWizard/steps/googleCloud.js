import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  Button,
  Popover,
  Text,
  TextContent,
  TextList,
  TextListItem,
  Title,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import nextStepMapper from './imageOutputStepMapper';
import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

export const googleAccType = {
  googleAccount: 'Google account',
  serviceAccount: 'Service account',
  googleGroup: 'Google group',
  domain: 'Domain',
};

const PopoverInfo = ({ appendTo }) => {
  return (
    <Popover
      appendTo={appendTo}
      hasAutoWidth
      maxWidth="35rem"
      headerContent={'Valid account types'}
      flipBehavior={['right', 'bottom', 'top', 'left']}
      bodyContent={
        <TextContent>
          <Text>
            The following account types can have an image shared with them:
          </Text>
          <TextList className="pf-u-ml-0">
            <TextListItem>
              <strong>Google account:</strong> A Google account represents a
              developer, an administrator, or any other person who interacts
              with Google Cloud. For example: <em>`alice@gmail.com`</em>.
            </TextListItem>
            <TextListItem>
              <strong>Service account:</strong> A service account is an account
              for an application instead of an individual end user. For example:{' '}
              <em>`myapp@appspot.gserviceaccount.com`</em>.
            </TextListItem>
            <TextListItem>
              <strong>Google group:</strong> A Google group is a named
              collection of Google accounts and service accounts. For example:{' '}
              <em>`admins@example.com`</em>.
            </TextListItem>
            <TextListItem>
              <strong>Google Workspace domain or Cloud Identity domain:</strong>{' '}
              A Google workspace or cloud identity domain represents a virtual
              group of all the Google accounts in an organization. These domains
              represent your organization&apos;s internet domain name. For
              example: <em>`mycompany.com`</em>.
            </TextListItem>
          </TextList>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Account info"
        aria-describedby="google-account-type"
        className="pf-c-form__group-label-help"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

PopoverInfo.propTypes = {
  appendTo: PropTypes.any,
};

const googleCloudStep = {
  StepTemplate,
  id: 'wizard-target-gcp',
  title: 'Google Cloud Platform',
  customTitle: (
    <Title headingLevel="h1" size="xl">
      Target environment - Google Cloud Platform
    </Title>
  ),
  name: 'google-cloud-target-env',
  substepOf: 'Target environment',
  nextStep: ({ values }) =>
    nextStepMapper(values, { skipGoogle: true, skipAws: true }),
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'google-cloud-text-component',
      label: (
        <p>
          Select how to share your image. The image you create can be used to
          launch instances on GCP, regardless of which method you select.
        </p>
      ),
    },
    {
      component: componentTypes.RADIO,
      label: 'Select image sharing',
      isRequired: true,
      name: 'image-sharing',
      initialValue: 'gcp-account',
      autoFocus: true,
      options: [
        {
          label: 'Share image with a Google account',
          'data-testid': 'account-sharing',
          autoFocus: true,
          description: (
            <p>
              Your image will be uploaded to GCP and shared with the account you
              provide below.
              <b>The image expires in 14 days.</b> To keep permanent access to
              your image, copy it to your GCP project.
            </p>
          ),
          value: 'gcp-account',
        },
        {
          label: 'Share image with Red Hat Insights only',
          'data-testid': 'insights-only-sharing',
          description: (
            <p>
              Your image will be uploaded to GCP and shared with Red Hat
              Insights.
              <b> The image expires in 14 days.</b> You cannot access or
              recreate this image in your GCP project.
            </p>
          ),
          value: 'insights',
          autoFocus: true,
        },
      ],
    },
    {
      component: 'radio-popover',
      label: 'Account type',
      isRequired: true,
      Popover: PopoverInfo,
      name: 'google-account-type',
      initialValue: 'googleAccount',
      options: Object.entries(googleAccType).map(([value, label]) => ({
        label:
          value === 'domain'
            ? 'Google Workspace domain or Cloud Identity domain'
            : label,
        value,
        autoFocus: value === 'googleAccount' ? true : false,
      })),
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
      ],
      condition: {
        when: 'image-sharing',
        is: 'gcp-account',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'google-email',
      'data-testid': 'input-google-email',
      type: 'text',
      label: 'Principal (e.g. e-mail address)',
      condition: {
        and: [
          { when: 'image-sharing', is: 'gcp-account' },
          {
            or: [
              { when: 'google-account-type', is: 'googleAccount' },
              { when: 'google-account-type', is: 'serviceAccount' },
              { when: 'google-account-type', is: 'googleGroup' },
              { when: 'google-account-type', is: null },
            ],
          },
        ],
      },
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.PATTERN,
          pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$',
          message: 'Please enter a valid email address',
        },
      ],
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'google-domain',
      type: 'text',
      label: 'Domain',
      condition: {
        and: [
          { when: 'image-sharing', is: 'gcp-account' },
          { when: 'google-account-type', is: 'domain' },
        ],
      },
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
      ],
    },
  ],
};

export default googleCloudStep;
