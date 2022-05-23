import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import StepTemplate from './stepTemplate';

export default {
  StepTemplate,
  id: 'wizard-details',
  name: 'image-name',
  title: 'Name image',
  nextStep: 'review',
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'plain-text-component',
      label: (
        <p>
          Optionally enter a name for your image. All images will have a UUID.
        </p>
      ),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'image-name',
      type: 'text',
      label: 'Image name',
      autoFocus: true,
      validate: [
        {
          type: validatorTypes.MAX_LENGTH,
          threshold: 100,
        },
      ],
    },
  ],
};
