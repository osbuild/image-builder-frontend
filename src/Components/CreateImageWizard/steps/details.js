import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import StepTemplate from './stepTemplate';

export default {
    StepTemplate,
    id: 'wizard-details',
    name: 'details',
    title: 'Details',
    nextStep: 'image-output',
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'plain-text-component',
            label: <p>
                Enter a name to easily identify your image later. If left empty, the image&apos;s UUID will be displayed.
            </p>
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'image-name',
            type: 'text',
            label: 'Image name',
            validate: [
                {
                    type: validatorTypes.PATTERN,
                    pattern: /^[\w-]+$/i,
                    message: 'Can only contain letters, numbers, hyphens (-), and underscores (_)',
                }
            ]
        }
    ]
};
