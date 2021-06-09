import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { HelpIcon } from '@patternfly/react-icons';
import nextStepMapper from './stepMapper';
import { Title, Text, Popover, TextContent, TextList, TextListItem, Button } from '@patternfly/react-core';
import PropTypes from 'prop-types';

export const googleAccType = {
    googleAccount: 'Google account',
    serviceAccount: 'Service account',
    googleGroup: 'Google group',
    domain: 'Domain'
};

const PopoverInfo = ({ appendTo }) => <Popover
    position="right"
    appendTo={ appendTo }
    // hasAutoWidth
    maxWidth='35rem'
    headerContent={ 'Valid account types' }
    bodyContent={ <TextContent>
        <Text>The following account types can have an image shared with them:</Text>
        <TextList>
            <TextListItem>
                <strong>Google account:</strong> A Google account represents a developer, an administrator,
            or any other person who interacts with Google Cloud. e.g., <em>`alice@gmail.com`</em>.
            </TextListItem>
            <TextListItem>
                <strong>Service account:</strong> A service account is an account for an application instead
            of an individual end user. e.g., <em>`myapp@appspot.gserviceaccount.com`</em>.
            </TextListItem>
            <TextListItem>
                <strong>Google group:</strong> A Google group is a named collection of Google accounts and
            and service accounts. e.g., <em>`admins@example.com`</em>.
            </TextListItem>
            <TextListItem>
                <strong>Google workspace domain/Cloud identity domain:</strong> A Google workspace or cloud identity
            domain represents a virtual group of all the Google accounts in an organization. These domains
            represent your organization&apos;s internet domain name. e.g., <em>`mycompany.com`</em>.
            </TextListItem>
        </TextList>
    </TextContent> }>
    <Button
        variant="plain"
        aria-label="Account info"
        aria-describedby="google-account-type"
        className="pf-c-form__group-label-help">
        <HelpIcon />
    </Button>
</Popover>;

PopoverInfo.propTypes = {
    appendTo: PropTypes.any
};

export default {
    title: 'Google Cloud Platform',
    customTitle: <Title headingLevel="h1" size="xl">Target Environment - Google Cloud Platform</Title>,
    name: 'google-cloud-target-env',
    substepOf: 'Target environment',
    nextStep: ({ values }) => nextStepMapper(values, true, true),
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'google-cloud-text-component',
            label: <Text>
            Your image will be uploaded to Google Cloud Platform and shared with the email you provide below. <br />
            The image should be copied to your account within 14 days.
            </Text>
        },
        {
            component: 'radio-popover',
            label: 'Type',
            Popover: PopoverInfo,
            name: 'google-account-type',
            initialValue: 'googleAccount',
            options: Object.entries(googleAccType).map(([ value, label ]) => ({
                label: value === 'domain' ? 'Google Workspace Domain or Cloud Identity Domain' : label,
                value
            })),
            isRequired: true,
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
                ]
            },
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
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
                is: 'domain'
            },
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
            ],
        }
    ]
};
