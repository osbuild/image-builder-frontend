import React, { useState } from 'react';

import {
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  TextInputProps,
  Tooltip,
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
    environments.includes('azure')
  );
  const { ruleLength, ruleCharacters } = validationState;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <FormGroup label="Password" className="pf-v6-u-pb-md">
      <>
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              isRequired
              type={isPasswordVisible ? 'text' : 'password'}
              value={value}
              onChange={onChange}
              aria-label={ariaLabel}
              placeholder={hasPassword ? '●'.repeat(8) : placeholder}
            />
          </InputGroupItem>
          <InputGroupItem>
            {hasPassword && !value ? (
                <Tooltip content="Passwords cannot be viewed when editing a blueprint for security reasons">
                <span>
                  <Button
                      variant="control"
                      onClick={togglePasswordVisibility}
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      isDisabled={true}
                  >
                    {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                  </Button>
                </span>
                </Tooltip>
            ) : (
                <Button
                    variant="control"
                    onClick={togglePasswordVisibility}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    isDisabled={hasPassword && !value}
                >
                  {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                </Button>
            )}
          </InputGroupItem>
        </InputGroup>
      </>
      <FormHelperText>
        <HelperText component="ul">
          <HelperTextItem variant={ruleLength} component="li">
            Password must be at least 6 characters long
          </HelperTextItem>
          {environments.includes('azure') && (
            <HelperTextItem variant={ruleCharacters} component="li">
              Must include at least 3 of the following: lowercase letters,
              uppercase letters, numbers, symbols
            </HelperTextItem>
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
