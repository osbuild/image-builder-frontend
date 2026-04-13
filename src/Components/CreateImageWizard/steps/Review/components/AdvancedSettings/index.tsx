import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useFlag } from '@/Utilities/useGetEnvironment';

import { Filesystem, Hostname, Locale, Timezone } from './components';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

const AdvancedSettingsOverview = ({ restrictions }: ReviewCardProps) => {
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
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default AdvancedSettingsOverview;
