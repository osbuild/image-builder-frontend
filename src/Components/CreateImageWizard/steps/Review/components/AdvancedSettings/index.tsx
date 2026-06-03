import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import {
  Filesystem,
  Firewall,
  Firstboot,
  Hostname,
  Kernel,
  Locale,
  Services,
  Timezone,
  Users,
} from './components';
import { UserGroups } from './components/UserGroups';

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
  return (
    <Card>
      <ReviewCardHeader
        title='Advanced settings'
        stepId='advanced-settings-step'
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
          <Firewall shouldHide={restrictions.firewall.shouldHide} />
          <Users shouldHide={restrictions.users.shouldHide} />
          <UserGroups shouldHide={restrictions.users.shouldHide} />
          <Firstboot shouldHide={restrictions.firstBoot.shouldHide} />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default AdvancedSettingsOverview;
