import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedInput } from '@/Components/CreateImageWizard/ValidatedInput';
import { isAzureTenantGUIDValid } from '@/Components/CreateImageWizard/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureTenantId,
  selectAzureTenantId,
} from '@/store/slices/wizard';

const TenantIdInput = () => {
  const dispatch = useAppDispatch();
  const tenantId = useAppSelector(selectAzureTenantId);

  return (
    <FormGroup label='Azure tenant GUID' isRequired>
      <ValidatedInput
        aria-label='Azure tenant GUID'
        value={tenantId || ''}
        validator={isAzureTenantGUIDValid}
        onChange={(_event, value) => dispatch(changeAzureTenantId(value))}
        helperText={
          !tenantId ? 'Tenant ID is required' : 'Please enter a valid tenant ID'
        }
        handleClear={() => dispatch(changeAzureTenantId(''))}
      />
    </FormGroup>
  );
};

export default TenantIdInput;
