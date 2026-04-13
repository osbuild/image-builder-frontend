import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useFlag } from '@/Utilities/useGetEnvironment';

import {
  Filesystem,
  Hostname,
  Kernel,
  Locale,
  Services,
  Timezone,
} from './components';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

type OscapServices = {
  enabled: string[];
  disabled: string[];
  masked: string[];
};

type AdvancedSettingsOverviewProps = ReviewCardProps & {
  oscapKernelArgs?: string[];
  oscapServices?: OscapServices;
};

const AdvancedSettingsOverview = ({
  restrictions,
  oscapKernelArgs = [],
  oscapServices,
}: AdvancedSettingsOverviewProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  return (
    <Card>
      <ReviewCardHeader
        title='Advanced settings'
        stepId={
          // NOTE: this doesn't really map properly on to the old wizard, so
          // let's just take the user to the filesystem step by default.
          isWizardRevampEnabled ? 'advanced-settings-step' : 'step-file-system'
        }
      />
      <CardBody>
        <ReviewList>
          <Filesystem shouldHide={restrictions.filesystem.shouldHide} />
          <Timezone shouldHide={restrictions.timezone.shouldHide} />
          <Locale shouldHide={restrictions.locale.shouldHide} />
          <Hostname shouldHide={restrictions.hostname.shouldHide} />
          <Kernel
            shouldHide={restrictions.kernel.shouldHide}
            oscapKernelArgs={oscapKernelArgs}
          />
          <Services
            shouldHide={restrictions.services.shouldHide}
            oscapServices={oscapServices}
          />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default AdvancedSettingsOverview;
