import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { isAzureSubscriptionIdValid } from '@/Components/CreateImageWizard/validators';
import { ValidatedInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureSubscriptionId,
  selectAzureSubscriptionId,
} from '@/store/slices/wizard';

const SubscriptionIdInput = () => {
  const dispatch = useAppDispatch();
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);

  return (
    <FormGroup label='Subscription ID' isRequired style={{ maxWidth: '50%' }}>
      <ValidatedInput
        aria-label='subscription id'
        value={subscriptionId || ''}
        validator={isAzureSubscriptionIdValid}
        onChange={(_event, value) => dispatch(changeAzureSubscriptionId(value))}
        helperText={
          !subscriptionId
            ? 'Subscription ID is required'
            : 'Please enter a valid subscription ID'
        }
        handleClear={() => dispatch(changeAzureSubscriptionId(''))}
        placeholder='Enter your 36-character ID'
      />
    </FormGroup>
  );
};

export default SubscriptionIdInput;
