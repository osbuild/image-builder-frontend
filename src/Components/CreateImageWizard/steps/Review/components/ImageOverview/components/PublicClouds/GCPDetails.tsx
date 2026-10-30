import React, { useMemo } from 'react';

import { Content } from '@patternfly/react-core';

import { DetailsStack } from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { useAppSelector } from '@/store/hooks';
import { selectGcpAccountType, selectGcpPrincipal } from '@/store/slices';

export const GCPDetails = () => {
  const principal = useAppSelector(selectGcpPrincipal);
  const accountType = useAppSelector(selectGcpAccountType);

  const getAccountType = useMemo(() => {
    if (accountType === 'group') return 'Google group';
    if (accountType === 'serviceAccount') return 'Service account';
    if (accountType === 'user') return 'Google account';
    return 'Domain';
  }, [accountType]);

  if (!accountType) return null;

  return (
    <DetailsStack heading='Google Cloud'>
      <Content component='p'>
        Account type: {getAccountType}
        <br />
        {accountType === 'domain' ? 'Domain' : 'Principal'}
        {': '}
        {principal || accountType}
        <br />
      </Content>
    </DetailsStack>
  );
};
