import React, { useEffect, useState } from 'react';

import { FormGroup } from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeHostname,
  selectHostname,
  validateHostname,
} from '@/store/slices/wizard';

const HostnameInput = () => {
  const dispatch = useAppDispatch();
  const hostname = useAppSelector(selectHostname);
  const [draftHostname, setDraftHostname] = useState(hostname ?? '');

  useEffect(() => {
    setDraftHostname(hostname ?? '');
  }, [hostname]);

  return (
    <FormGroup label='Hostname'>
      <ValidatedTextInput<string>
        value={draftHostname}
        onChange={(_, value) => setDraftHostname(value)}
        validator={validateHostname}
        onCommit={(value) => dispatch(changeHostname(value))}
        handleClear={() => {
          setDraftHostname('');
          dispatch(changeHostname(undefined));
        }}
        clearButtonAriaLabel='Clear hostname'
        placeholder='Add a hostname'
        ariaLabel='hostname input'
      />
    </FormGroup>
  );
};

export default HostnameInput;
