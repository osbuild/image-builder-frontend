import React, { useState } from 'react';

import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { changeHostname, selectHostname } from '@/store/slices/wizard';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useHostnameValidation } from '../../../utilities/useValidation';

const HostnameInput = () => {
  const dispatch = useAppDispatch();
  const hostname = useAppSelector(selectHostname);
  const [isPristine, setIsPristine] = useState(!hostname);
  const stepValidation = useHostnameValidation();

  const handleChange = (
    _e: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    dispatch(changeHostname(value));
    if (value === '') {
      setIsPristine(true);
    } else {
      setIsPristine(false);
    }
  };

  const handleClear = () => {
    dispatch(changeHostname(''));
    setIsPristine(true);
  };

  const handleBlur = () => {
    if (hostname) {
      setIsPristine(false);
    }
  };

  const hasError = !isPristine && !!stepValidation.errors.hostname;

  return (
    <FormGroup label='Hostname'>
      <TextInputGroup {...(hasError && { validated: 'error' })}>
        <TextInputGroupMain
          value={hostname}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='Add a hostname'
          aria-label='hostname input'
        />
        {hostname && (
          <TextInputGroupUtilities>
            <Button
              variant='plain'
              onClick={handleClear}
              aria-label='Clear hostname'
            >
              <TimesIcon />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
      {hasError && (
        <HelperText>
          <HelperTextItem variant='error'>
            {stepValidation.errors.hostname}
          </HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default HostnameInput;
