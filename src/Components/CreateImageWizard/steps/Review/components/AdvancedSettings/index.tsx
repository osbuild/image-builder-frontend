import React from 'react';

import { Card, CardBody, Divider } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectFirewallEnabled,
  selectFirstBootScript,
  selectHasUserGroups,
  selectHasUsers,
  selectHostname,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectServices,
} from '@/store/slices';

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
  const usersHidden = restrictions.users.shouldHide;
  const hasUsers = useAppSelector(selectHasUsers);
  const hasUserGroups = useAppSelector(selectHasUserGroups);
  const hostname = useAppSelector(selectHostname);
  const keyboard = useAppSelector(selectKeyboard);
  const languages = useAppSelector(selectLanguages);
  const kernel = useAppSelector(selectKernel);
  const services = useAppSelector(selectServices);
  const firewallEnabled = useAppSelector(selectFirewallEnabled);
  const firstBootScript = useAppSelector(selectFirstBootScript);

  const hasKernelConfig =
    kernel.name || kernel.append.length > 0 || oscapKernelArgs.length > 0;
  const hasServicesConfig =
    services.enabled.length > 0 ||
    services.disabled.length > 0 ||
    services.masked.length > 0 ||
    (oscapServices?.enabled.length ?? 0) > 0 ||
    (oscapServices?.disabled.length ?? 0) > 0 ||
    (oscapServices?.masked.length ?? 0) > 0;
  const hasLocaleConfig = keyboard || (languages && languages.length > 0);

  return (
    <Card>
      <ReviewCardHeader
        title='Advanced settings'
        stepId='advanced-settings-step'
      />
      <CardBody>
        {[
          !restrictions.filesystem.shouldHide && (
            <Filesystem key='filesystem' />
          ),
          !restrictions.timezone.shouldHide && <Timezone key='timezone' />,
          !restrictions.locale.shouldHide && hasLocaleConfig && (
            <Locale key='locale' />
          ),
          !restrictions.hostname.shouldHide && hostname && (
            <Hostname key='hostname' />
          ),
          !restrictions.kernel.shouldHide && hasKernelConfig && (
            <Kernel key='kernel' oscapKernelArgs={oscapKernelArgs} />
          ),
          !restrictions.services.shouldHide && hasServicesConfig && (
            <Services key='services' oscapServices={oscapServices} />
          ),
          !restrictions.firewall.shouldHide && firewallEnabled && (
            <Firewall key='firewall' />
          ),
          !usersHidden && hasUsers && (
            <ReviewSection key='users' title='Users'>
              <Users />
            </ReviewSection>
          ),
          !usersHidden && hasUserGroups && (
            <ReviewSection key='groups' title='Groups'>
              <UserGroups />
            </ReviewSection>
          ),
          !restrictions.firstboot.shouldHide && firstBootScript && (
            <Firstboot key='firstboot' />
          ),
        ]
          .filter(Boolean)
          .flatMap((component, index, array) =>
            index < array.length - 1
              ? [
                  component,
                  <Divider
                    key={`divider-${index}`}
                    className='pf-v6-u-mt-lg pf-v6-u-mb-md'
                  />,
                ]
              : [component],
          )}
      </CardBody>
    </Card>
  );
};

export default AdvancedSettingsOverview;
