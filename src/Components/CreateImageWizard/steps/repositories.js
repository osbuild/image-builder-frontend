import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Button, Text } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import nextStepMapper from './repositoriesStepMapper';
import StepTemplate from './stepTemplate';

import { useGetEnvironment } from '../../../Utilities/useGetEnvironment';
import CustomButtons from '../formComponents/CustomButtons';

const VisitButton = () => {
  const { isBeta } = useGetEnvironment();
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      iconPosition="right"
      isInline
      icon={<ExternalLinkAltIcon />}
      href={isBeta() ? '/preview/settings/content' : '/settings/content'}
    >
      Create and manage repositories here
    </Button>
  );
};

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
          <VisitButton />
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
