import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Title, Text, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import nextStepMapper from './imageOutputStepMapper';

export default {
    title: 'Microsoft Azure',
    customTitle: <Title headingLevel="h1" size="xl">Target environment - Microsoft Azure</Title>,
    name: 'ms-azure-target-env',
    substepOf: 'Target environment',
    nextStep: ({ values }) => nextStepMapper(values, { skipAws: true, skipGoogle: true, skipAzure: true }),
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'azure-text-component',
            label: <>
                <Text>
                    Image Builder sends an image to an authorized Azure account.
                </Text>
                <Title headingLevel="h3">Authorizing an Azure account</Title>
                <Text>
            To authorize Image Builder to push images to Microsoft Azure, the account owner
            must configure Image Builder as an authorized application for a specific tenant ID and give it the role of
            &quot;Contributor&quot; to at least one resource group.<br />
                </Text>
                <small>
                    <Button
                        component="a"
                        target="_blank"
                        variant="link"
                        icon={ <ExternalLinkAltIcon /> }
                        iconPosition="right"
                        isInline
                        href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow">
                      Learn more about OAuth 2.0
                    </Button>
                </small>
                <Title headingLevel="h2">Image Destination</Title>
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
            label: 'Tenant GUID',
            required: true,
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
                {
                    type: validatorTypes.PATTERN,
                    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    message: 'Please enter a valid tenant GUID',
                }
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
            'data-testid': 'azure-subscription-id',
            type: 'text',
            label: 'Subscription GUID',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
                {
                    type: validatorTypes.PATTERN,
                    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    message: 'Please enter a valid subscription GUID',
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
