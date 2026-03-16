import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedInput } from '@/Components/CreateImageWizard/ValidatedInput';
import { isAzureSubscriptionIdValid } from '@/Components/CreateImageWizard/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureSubscriptionId,
  selectAzureSubscriptionId,
} from '@/store/wizardSlice';

const SubscriptionIdInput = () => {
  const dispatch = useAppDispatch();
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);

  return (
    <FormGroup label='Subscription ID' isRequired>
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
      />
    </FormGroup>
  );
};

export default SubscriptionIdInput;
