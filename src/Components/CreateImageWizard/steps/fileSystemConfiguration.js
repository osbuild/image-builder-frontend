import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  Button,
  Label,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import StepTemplate from './stepTemplate';

import FileSystemConfigButtons from '../formComponents/FileSystemConfigButtons';

export default {
  StepTemplate,
  id: 'wizard-systemconfiguration-filesystem',
  title: 'File system configuration',
  name: 'File system configuration',
  buttons: FileSystemConfigButtons,
  nextStep: 'packages',
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'file-system-configuration-text-component',
      label: (
        <>
          <Text>Define the partitioning of the image</Text>
        </>
      ),
    },
    {
      component: componentTypes.RADIO,
      name: 'file-system-config-radio',
      initialValue: 'automatic',
      options: [
        {
          label: (
            <>
              <Text>
                <Label isCompact color="blue">
                  Recommended
                </Label>{' '}
                Use automatic partitioning
              </Text>
            </>
          ),
          description:
            'Automatically partition your image to what is best, depending on the target environment(s)',
          value: 'automatic',
          'data-testid': 'file-system-config-radio-automatic',
          autoFocus: true,
        },
        {
          label: 'Manually configure partitions',
          description:
            'Manually configure the file system of your image by adding, removing, and editing partitions',
          value: 'manual',
          'data-testid': 'file-system-config-radio-manual',
          className: 'pf-u-mt-sm',
        },
      ],
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
        when: 'file-system-config-radio',
        is: 'manual',
      },
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'automatic-partitioning-info',
      label: (
        <TextContent>
          <Text component={TextVariants.h3}>Automatic partitioning</Text>
          <Text>
            Red Hat will automatically partition your image to what is best,
            depending on the target environment(s).
          </Text>
          <Text>
            The target environment sometimes dictates the partitioning scheme or
            parts of it, and sometimes the target environment is unknown (e.g.,
            for the .qcow2 generic cloud image).
          </Text>
          <Text>
            Using automatic partitioning will apply the most current supported
            configuration.
            <br></br>
            <Button
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_images_by_using_insights_image_builder/customizing-file-systems-during-the-image-creation"
              className="pf-u-pl-0"
            >
              Customizing file systems during the image creation
            </Button>
          </Text>
        </TextContent>
      ),
      condition: {
        or: [{ when: 'file-system-config-radio', is: 'automatic' }],
      },
    },
  ],
};
