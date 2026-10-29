import React, { useEffect, useState } from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureSubscriptionId,
  selectAzureSubscriptionId,
  validateAzureSubscriptionId,
} from '@/store/slices/wizard';

const SubscriptionIdInput = () => {
  const dispatch = useAppDispatch();
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);
  const [draft, setDraft] = useState(subscriptionId ?? '');

  useEffect(() => {
    // Reset local drafts when the committed subscription id changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(subscriptionId ?? '');
  }, [subscriptionId]);

  const clear = () => {
    setDraft('');
    dispatch(changeAzureSubscriptionId(''));
  };

  return (
    <FormGroup label='Subscription ID' isRequired style={{ maxWidth: '50%' }}>
      <ValidatedTextInput
        ariaLabel='subscription id'
        value={draft}
        validator={validateAzureSubscriptionId}
        onChange={(_, value) => setDraft(value)}
        onCommit={(candidate) => {
          if (!candidate) return;
          dispatch(changeAzureSubscriptionId(candidate));
        }}
        handleClear={clear}
        placeholder='Enter your 36-character ID'
      />
    </FormGroup>
  );
};

export default SubscriptionIdInput;
