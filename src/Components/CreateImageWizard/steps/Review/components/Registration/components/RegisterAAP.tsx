import React from 'react';

import { useAppSelector } from '@/store/hooks';
import {
  selectAapCallbackUrl,
  selectAapHostConfigKey,
  selectAapTlsConfigured,
} from '@/store/slices';

import { ReviewGroup, StatusItem } from '../../shared';
import { Hideable } from '../../types';

export const RegisterAAP = ({ shouldHide }: Hideable) => {
  const callbackUrl = useAppSelector(selectAapCallbackUrl);
  const hostConfigKey = useAppSelector(selectAapHostConfigKey);
  const tlsConfigured = useAppSelector(selectAapTlsConfigured);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='Ansible automation platform'
        description={<StatusItem>Enabled</StatusItem>}
      />
      <ReviewGroup heading='Ansible callback url' description={callbackUrl} />
      <ReviewGroup heading='Host config key' description={hostConfigKey} />
      <ReviewGroup
        heading='TLS certificate'
        description={
          <StatusItem variant={tlsConfigured ? 'success' : 'danger'}>
            {tlsConfigured ? 'Configured' : 'Not configured'}
          </StatusItem>
        }
      />
    </>
  );
};
