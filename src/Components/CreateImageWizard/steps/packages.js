import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

import isPreview from '../../../Utilities/isPreview';
import CustomButtons from '../formComponents/CustomButtons';

export default {
  StepTemplate,
  id: 'wizard-systemconfiguration-packages',
  title: 'Additional Red Hat packages',
  name: 'packages',
  substepOf: 'Content',
  nextStep: () => {
    if (isPreview()) {
      return 'repositories';
    } else {
      return 'image-name';
    }
  },
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'packages-text-component',
      label: (
        <Text>
          Images built with Image Builder include all required packages.
          <br />
          You can add additional packages to your image by searching
          &quot;Available packages&quot; and adding them to the &quot;Chosen
          packages&quot; list.
        </Text>
      ),
    },
    {
      component: 'package-selector',
      name: 'selected-packages',
      label: 'Available options',
    },
  ],
};
