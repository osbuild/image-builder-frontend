import React, { useState } from 'react';

import {
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

import { checkPasswordValidity } from './useValidation';

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    validationState: { ruleLength },
  } = checkPasswordValidity(value);

  return (
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
      <FormHelperText>
        <HelperText component='ul'>
          <HelperTextItem variant={ruleLength} component='li'>
            Password must be at least 6 characters long
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </>
  );
};
