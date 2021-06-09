import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import nextStepMapper from './stepMapper';
import { Title } from '@patternfly/react-core';

export default {
    title: 'Amazon Web Services',
    customTitle: <Title headingLevel="h1" size="xl">Target Environment - Amazon Web Service</Title>,
    name: 'aws-target-env',
    substepOf: 'Target environment',
    nextStep: ({ values }) => nextStepMapper(values, true),
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'plain-text-component',
            label: <p>
            Your image will be uploaded to a temporary account on Amazon Web Services. <br />
            The image will be shared with the account you provide below. <br />
            Within the next 14 days you will need to copy the shared image to your own account.
            After 14 days it will be unavailable and will have to be regenerated.
            </p>
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'aws-account-id',
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
                    threshold: 12
                }
            ],
        }
    ]
};
