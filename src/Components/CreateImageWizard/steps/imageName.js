import React from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Flex, FlexItem, Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

const CharacterCount = () => {
  const { getState } = useFormApi();
  const description = getState().values?.['image-description'];
  return <h1>{description?.length || 0}/250</h1>;
};

const imageNameStep = {
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
    {
      component: componentTypes.TEXTAREA,
      name: 'image-description',
      type: 'text',
      label: (
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Text component={'b'}>Description</Text>
          </FlexItem>
          <FlexItem>
            <CharacterCount />
          </FlexItem>
        </Flex>
      ),
      placeholder: 'Add Description',
      resizeOrientation: 'vertical',
      validate: [{ type: validatorTypes.MAX_LENGTH, threshold: 250 }],
    },
  ],
};

export default imageNameStep;
