import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import nextStepMapper from './repositoriesStepMapper';
import StepTemplate from './stepTemplate';

import CustomButtons from '../formComponents/CustomButtons';

export default {
  StepTemplate,
  id: 'wizard-repositories',
  title: 'Custom repositories',
  name: 'repositories',
  substepOf: 'Content',
  nextStep: ({ values }) => nextStepMapper(values),
  buttons: CustomButtons,
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'packages-text-component',
      label: (
        <Text>
          Select custom repositories from which to search and add packages to
          this image.
          <br />
          Custom repositories can be managed using the Repositories app on Red
          Hat Insights.
        </Text>
      ),
    },
    {
      component: 'repositories-table',
      name: 'payload-repositories',
      label: 'Custom repositories',
    },
  ],
};
