import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Text } from '@patternfly/react-core';

import StepTemplate from './stepTemplate';

export default {
  StepTemplate,
  id: 'wizard-systemconfiguration-filesystem',
  title: 'File system configuration',
  name: 'File system configuration',
  substepOf: 'System configuration',
  nextStep: 'packages',
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'file-system-configuration-text-component',
      label: (
        <>
          <Text>
            Red Hat recommends using automatic partitioning for most
            installations.
          </Text>
          <Text>
            Alternatively, you may manually configure the file system of your
            image by adding, removing, and editing partitions.
          </Text>
        </>
      ),
    },
    {
      component: 'file-system-config-toggle',
      name: 'file-system-config-toggle',
      label: 'File system configurations toggle',
    },
    {
      component: 'file-system-configuration',
      name: 'file-system-configuration',
      label: 'File system configurations',
      validate: [
        { type: 'fileSystemConfigurationValidator' },
        { type: validatorTypes.REQUIRED },
      ],
      condition: {
        when: 'file-system-config-toggle',
        is: 'manual',
      },
    },
  ],
};
