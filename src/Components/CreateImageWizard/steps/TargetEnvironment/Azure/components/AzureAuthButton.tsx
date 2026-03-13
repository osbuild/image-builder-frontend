import React from 'react';

import { Button, FormGroup } from '@patternfly/react-core';

import { isAzureTenantGUIDValid } from '@/Components/CreateImageWizard/validators';
import { useAppSelector } from '@/store/hooks';
import { selectAzureTenantId } from '@/store/slices/wizard';

const AzureAuthButton = () => {
  const tenantId = useAppSelector(selectAzureTenantId);

  return (
    <FormGroup>
      <Button
        component='a'
        target='_blank'
        variant='secondary'
        isDisabled={!tenantId || !isAzureTenantGUIDValid(tenantId)}
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
