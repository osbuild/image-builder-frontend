import React, { useEffect, useState } from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureTenantId,
  selectAzureTenantId,
  validateAzureTenantId,
} from '@/store/slices/wizard';

const TenantIdInput = () => {
  const dispatch = useAppDispatch();
  const tenantId = useAppSelector(selectAzureTenantId);
  const [draft, setDraft] = useState(tenantId ?? '');

  useEffect(() => {
    // Reset local drafts when the committed tenant id changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(tenantId ?? '');
  }, [tenantId]);

  const clear = () => {
    setDraft('');
    dispatch(changeAzureTenantId(''));
  };

  return (
    <FormGroup label='Azure tenant GUID' isRequired style={{ maxWidth: '50%' }}>
      <ValidatedTextInput
        ariaLabel='Azure tenant GUID'
        value={draft}
        validator={validateAzureTenantId}
        onChange={(_, value) => setDraft(value)}
        onCommit={(candidate) => {
          if (!candidate) return;

          dispatch(changeAzureTenantId(candidate));
        }}
        handleClear={clear}
        placeholder='Enter your 36-character GUID'
      />
    </FormGroup>
  );
};

export default TenantIdInput;
