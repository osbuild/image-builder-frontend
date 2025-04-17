import React, { useState } from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  Button,
  TextInputProps,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { checkPasswordValidity } from './useValidation';

import { useAppSelector } from '../../../store/hooks';
import { selectImageTypes } from '../../../store/wizardSlice';

type ValidatedPasswordInput = TextInputProps & {
  value: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
};

export const PasswordValidatedInput = ({
  value,
  placeholder,
  ariaLabel,
  onChange,
}: ValidatedPasswordInput) => {
  const environments = useAppSelector(selectImageTypes);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { validationState } = checkPasswordValidity(
    value,
    environments.includes('azure')
  );
  const { ruleLength, ruleCharacters } = validationState;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <FormGroup label="Password" isRequired>
      <>
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              isRequired
              type={isPasswordVisible ? 'text' : 'password'}
              value={value}
              onChange={onChange}
              aria-label={ariaLabel}
              placeholder={placeholder}
            />
          </InputGroupItem>
          <InputGroupItem>
            <Button
              variant="control"
              onClick={togglePasswordVisibility}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          </InputGroupItem>
        </InputGroup>
      </>
      <FormHelperText>
        <HelperText component="ul">
          <HelperTextItem variant={ruleLength} component="li" hasIcon>
            Password must be at least 6 characters long
          </HelperTextItem>
          {environments.includes('azure') && (
            <HelperTextItem variant={ruleCharacters} component="li" hasIcon>
              Must include at least 3 of the following: lowercase letters,
              uppercase letters, numbers, symbols
            </HelperTextItem>
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
