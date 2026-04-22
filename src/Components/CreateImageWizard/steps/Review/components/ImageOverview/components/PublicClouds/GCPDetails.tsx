import React, { useMemo } from 'react';

import { Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectGcpAccountType, selectGcpEmail } from '@/store/slices';

import { DetailsStack } from '../../../shared';

export const GCPDetails = () => {
  const principal = useAppSelector(selectGcpEmail);
  const accountType = useAppSelector(selectGcpAccountType);

  const getAccountType = useMemo(() => {
    if (accountType === 'group') return 'Google group';
    if (accountType === 'serviceAccount') return 'Service account';
    if (accountType === 'user') return 'Google account';
    return 'Domain';
  }, [accountType]);

  return (
    <DetailsStack heading='Google Cloud'>
      <Content component='p'>
        Account type: {getAccountType}
        <br />
        {getAccountType === 'Domain' ? 'Domain' : 'Principal'}:{' '}
        {principal || accountType}
        <br />
      </Content>
    </DetailsStack>
  );
};
