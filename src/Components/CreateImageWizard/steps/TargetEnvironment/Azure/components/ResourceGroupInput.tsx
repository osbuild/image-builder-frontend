import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedInput } from '@/Components/CreateImageWizard/ValidatedInput';
import { isAzureResourceGroupValid } from '@/Components/CreateImageWizard/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureResourceGroup,
  selectAzureResourceGroup,
} from '@/store/wizardSlice';

const ResourceGroupInput = () => {
  const dispatch = useAppDispatch();
  const resourceGroup = useAppSelector(selectAzureResourceGroup);

  return (
    <FormGroup label='Resource group' isRequired>
      <ValidatedInput
        aria-label='resource group'
        value={resourceGroup || ''}
        validator={isAzureResourceGroupValid}
        onChange={(_event, value) => dispatch(changeAzureResourceGroup(value))}
        helperText={
          !resourceGroup
            ? 'Resource group is required'
            : 'Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period'
        }
        handleClear={() => dispatch(changeAzureResourceGroup(''))}
      />
    </FormGroup>
  );
};

export default ResourceGroupInput;
