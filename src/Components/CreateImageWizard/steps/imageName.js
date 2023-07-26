import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

export default {
  StepTemplate,
  id: 'wizard-details',
  name: 'details',
  title: 'Details',
  nextStep: 'review',
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'plain-text-component',
      label: (
        <p>
          Optionally enter a name to identify your image later quickly. If you
          do not provide one, the UUID will be used as the name.
        </p>
      ),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'image-name',
      type: 'text',
      label: 'Image Name',
      placeholder: 'Image Name',
      helperText:
        'The image name can be 3-63 characters long. It can contain lowercase letters, digits and hyphens, has to start with a letter and cannot end with a hyphen.',
      autoFocus: true,
      validate: [
        {
          type: validatorTypes.PATTERN,
          pattern: /^[a-z][-a-z0-9]{1,61}[a-z0-9]$/,
          message:
            'The image name can be 3-63 characters long. It can contain lowercase letters, digits and hyphens, has to start with a letter and cannot end with a hyphen.',
        },
      ],
    },
  ],
};
