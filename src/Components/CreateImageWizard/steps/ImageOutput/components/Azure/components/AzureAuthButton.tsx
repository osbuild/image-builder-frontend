import React from 'react';

import { Button, FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectAzureTenantId,
  validateAzureTenantId,
} from '@/store/slices/wizard';

const AzureAuthButton = () => {
  const tenantId = useAppSelector(selectAzureTenantId);
  const { errors } = validateAzureTenantId(tenantId);

  return (
    <FormGroup>
      <Button
        component='a'
        target='_blank'
        variant='secondary'
        isDisabled={!tenantId || errors.length > 0}
        href={
          'https://login.microsoftonline.com/' +
          tenantId +
          '/oauth2/v2.0/authorize?client_id=b94bb246-b02c-4985-9c22-d44e66f657f4&scope=openid&' +
          'response_type=code&response_mode=query&redirect_uri=https://portal.azure.com'
        }
      >
        Authorize Image Builder
      </Button>
    </FormGroup>
  );
};

export default AzureAuthButton;
