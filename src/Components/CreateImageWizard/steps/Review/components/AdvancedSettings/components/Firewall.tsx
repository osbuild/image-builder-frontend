import React, { useMemo } from 'react';

import { Flex } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectFirewall, selectFirewallEnabled } from '@/store/slices';

import { FlexColumn, ReviewGroup, StatusItem } from '../../shared';
import { Hideable } from '../../types';

const padArray = (arr: string[], length: number): string[] => {
  return [...arr, ...Array(length - arr.length).fill('--')];
};

export const Firewall = ({ shouldHide }: Hideable) => {
  const firewall = useAppSelector(selectFirewall);
  const isEnabled = useAppSelector(selectFirewallEnabled);

  const { ports, enabled, disabled } = useMemo(() => {
    const maxLength = Math.max(
      firewall.ports.length,
      firewall.services.enabled.length,
      firewall.services.disabled.length,
    );

    return {
      ports: padArray(firewall.ports, maxLength),
      enabled: padArray(firewall.services.enabled, maxLength),
      disabled: padArray(firewall.services.disabled, maxLength),
    };
  }, [firewall]);

  if (shouldHide || !isEnabled) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='Firewall'
        description={<StatusItem>Enabled</StatusItem>}
      />
      <Flex>
        <FlexColumn
          heading='Ports'
          items={ports}
          labelKey='firewall-review-port'
        />
        <FlexColumn
          heading='Enabled services'
          items={enabled}
          labelKey='firewall-review-enabled'
        />
        <FlexColumn
          heading='Disabled services'
          items={disabled}
          labelKey='firewall-review-disabled'
        />
      </Flex>
    </>
  );
};
