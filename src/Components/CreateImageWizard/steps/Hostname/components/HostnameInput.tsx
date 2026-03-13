import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { changeHostname, selectHostname } from '@/store/slices/wizard';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useHostnameValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';

const HostnameInput = () => {
  const dispatch = useAppDispatch();
  const hostname = useAppSelector(selectHostname);

  const stepValidation = useHostnameValidation();

  const handleChange = (e: React.FormEvent, value: string) => {
    dispatch(changeHostname(value));
  };

  return (
    <FormGroup label='Hostname'>
      <ValidatedInputAndTextArea
        ariaLabel='hostname input'
        value={hostname}
        onChange={handleChange}
        placeholder='Add a hostname'
        stepValidation={stepValidation}
        fieldName='hostname'
      />
    </FormGroup>
  );
};

export default HostnameInput;
