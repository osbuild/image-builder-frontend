import React, { useState } from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

import { checkPasswordValidity } from './useValidation';

import { useAppSelector } from '../../../store/hooks';
import { selectImageTypes } from '../../../store/wizardSlice';

type ValidatedPasswordInput = TextInputProps & {
  value: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  hasPassword: boolean;
};

export const PasswordValidatedInput = ({
  value,
  placeholder,
  ariaLabel,
  onChange,
  hasPassword,
}: ValidatedPasswordInput) => {
  const environments = useAppSelector(selectImageTypes);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { validationState } = checkPasswordValidity(
    value,
    environments.includes('azure'),
  );
  const { ruleLength, ruleCharacters } = validationState;

  return (
    <FormGroup label='Password' className='pf-v6-u-pb-md'>
      <>
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              isRequired
              type={isPasswordVisible ? 'text' : 'password'}
              onFocus={() => setIsPasswordVisible(true)}
              onBlur={() => setIsPasswordVisible(false)}
              value={value}
              onChange={onChange}
              aria-label={ariaLabel}
              placeholder={hasPassword ? '●'.repeat(8) : placeholder}
            />
          </InputGroupItem>
        </InputGroup>
      </>
      <FormHelperText>
        <HelperText component='ul'>
          <HelperTextItem variant={ruleLength} component='li'>
            Password must be at least 6 characters long
          </HelperTextItem>
          {environments.includes('azure') && (
            <HelperTextItem variant={ruleCharacters} component='li'>
              Must include at least 3 of the following: lowercase letters,
              uppercase letters, numbers, symbols
            </HelperTextItem>
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
