import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Title, Text, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

export default {
    title: 'Microsoft Azure',
    customTitle: <Title headingLevel="h1" size="xl">Target Environment - Microsoft Azure</Title>,
    name: 'ms-azure-target-env',
    substepOf: 'Target environment',
    nextStep: ({ values }) => values?.release === 'rhel-8' ? 'registration' : 'packages',
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'azure-text-component',
            label: <>
                <Text>
            Image Builder will send an image to an authorized Azure account.
                </Text>
                <Title headingLevel="h3">OAuth permissions</Title>
                <Text>
            To authorize Image Builder to push images to Microsoft Azure, the account owner
            must configure Image Builder as an authorized application and give it the role of
            &quot;Contributor&quot; to at least one resource group.<br />
                </Text>
                <Button
                    component="a"
                    target="_blank"
                    variant="link"
                    icon={ <ExternalLinkAltIcon /> }
                    iconPosition="right"
                    isInline
                    href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow">
                    <small>Learn more about OAuth 2.0</small>
                </Button>
                <a href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=b94bb246-b02c-4985-9c22-d44e66f657f4
&scope=openid&response_type=code&response_mode=form_post
&redirect_uri=https%3A%2F%2Flogin.microsoftonline.com%2Fcommon%2Foauth2%2Fnativeclient" target="_blank" rel="noopener noreferrer">
            Authorize Image Builder on Azure <ExternalLinkAltIcon />
                </a>
                <Title headingLevel="h3">Destination</Title>
                <Text>
                    Your image will be uploaded to the resource group in the subscription you specify.
                </Text>
            </>
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'azure-tenant-id',
            'data-testid': 'azure-tenant-id',
            type: 'text',
            label: 'Tenant ID',
            required: true,
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
            ],
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'azure-subscription-id',
            'data-testid': 'azure-subscription-id',
            type: 'text',
            label: 'Subscription ID',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
            ],
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'azure-resource-group',
            'data-testid': 'azure-resource-group',
            type: 'text',
            label: 'Resource group',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
            ],
        }
        // TODO check oauth2 thing too here?
    ]
};
