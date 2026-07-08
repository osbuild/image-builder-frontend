import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectHasUserGroups, selectHasUsers } from '@/store/slices/wizard';

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

import { ReviewCardHeader, ReviewSection } from '../shared';
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
  const usersHidden =
    restrictions.users.shouldHide || restrictions.users.required;
  const hasUsers = !usersHidden && useAppSelector(selectHasUsers);
  const hasUserGroups = !usersHidden && useAppSelector(selectHasUserGroups);

  return (
    <Card>
      <ReviewCardHeader
        title='Advanced settings'
        stepId='advanced-settings-step'
      />
      <CardBody>
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
        {hasUserGroups && (
          <ReviewSection title='Groups'>
            <UserGroups />
          </ReviewSection>
        )}
        {hasUsers && (
          <ReviewSection title='Users'>
            <Users />
          </ReviewSection>
        )}
        <Firstboot shouldHide={restrictions.firstBoot.shouldHide} />
      </CardBody>
    </Card>
  );
};

export default AdvancedSettingsOverview;
