import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

import nextStepMapper from './repositoriesStepMapper';
import StepTemplate from './stepTemplate';

export default {
  StepTemplate,
  id: 'wizard-repositories',
  title: '3rd party repositories',
  name: 'repositories',
  substepOf: 'Content',
  nextStep: ({ values }) => nextStepMapper(values),
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'packages-text-component',
      label: (
        <Text>
          Select third party repositories from which to search and add packages
          to this image.
          <br />
          Third party repositories can be managed using the Repositories app on
          Red Hat Insights.
        </Text>
      ),
    },
    {
      component: 'repositories-table',
      name: 'third-party-repositories',
      label: 'Third party repositories',
    },
  ],
};
