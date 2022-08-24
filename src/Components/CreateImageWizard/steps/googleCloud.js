import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { HelpIcon } from '@patternfly/react-icons';
import nextStepMapper from './imageOutputStepMapper';
import {
  Title,
  Text,
  Popover,
  TextContent,
  TextList,
  TextListItem,
  Button,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import StepTemplate from './stepTemplate';

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

export default {
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
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'google-cloud-text-component',
      label: (
        <Text>
          Your image will be uploaded to Google Cloud Platform and shared with
          the account you provide below. <br />
          The shared image will expire within 14 days. To keep the image longer,
          copy it to your Google Cloud Platform account.
        </Text>
      ),
    },
    {
      component: 'radio-popover',
      label: 'Type',
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
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'google-email',
      'data-testid': 'input-google-email',
      type: 'text',
      label: 'Email address',
      condition: {
        or: [
          { when: 'google-account-type', is: 'googleAccount' },
          { when: 'google-account-type', is: 'serviceAccount' },
          { when: 'google-account-type', is: 'googleGroup' },
          { when: 'google-account-type', is: null },
        ],
      },
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
        },
        {
          type: validatorTypes.PATTERN,
          pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$',
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
        when: 'google-account-type',
        is: 'domain',
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
