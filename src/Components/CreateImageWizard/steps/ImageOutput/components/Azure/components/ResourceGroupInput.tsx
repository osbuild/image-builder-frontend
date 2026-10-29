import React, { useState } from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureResourceGroup,
  selectAzureResourceGroup,
  validateAzureResourceGroup,
} from '@/store/slices/wizard';

const ResourceGroupInput = () => {
  const dispatch = useAppDispatch();
  const resourceGroup = useAppSelector(selectAzureResourceGroup);
  const [draft, setDraft] = useState(resourceGroup ?? '');

  const clear = () => {
    setDraft('');
    dispatch(changeAzureResourceGroup(undefined));
  };

  return (
    <FormGroup label='Resource group' isRequired style={{ maxWidth: '50%' }}>
      <ValidatedTextInput
        ariaLabel='resource group'
        value={draft}
        validator={validateAzureResourceGroup}
        onChange={(_, value) => setDraft(value)}
        onCommit={(candidate) => {
          dispatch(changeAzureResourceGroup(candidate));
        }}
        handleClear={clear}
        placeholder='Enter your resource group'
      />
    </FormGroup>
  );
};

export default ResourceGroupInput;
