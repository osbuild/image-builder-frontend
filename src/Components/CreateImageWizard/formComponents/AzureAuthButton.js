import React from 'react';
import { Button, FormGroup } from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';

const AzureAuthButton = () => {
  const { getState } = useFormApi();

  const tenantId = getState()?.values?.['azure-tenant-id'];
  const guidRegex = new RegExp(
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    'i'
  );

  return (
    <FormGroup>
      <Button
        component="a"
        target="_blank"
        variant="secondary"
        isDisabled={!guidRegex.test(tenantId)}
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
