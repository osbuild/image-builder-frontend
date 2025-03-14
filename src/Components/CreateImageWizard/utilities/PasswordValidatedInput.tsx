import React, { useState } from 'react';

import {
  Form,
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

  const { validationState, strength } = checkPasswordValidity(value);
  const { ruleLength, ruleCharacters } = validationState;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const passStrLabel = (
    <HelperText>
      <HelperTextItem variant={strength.variant} icon={strength.icon}>
        {strength.text}
      </HelperTextItem>
    </HelperText>
  );

  return (
    <Form>
      <FormGroup
        label="Password"
        isRequired
        {...(ruleLength === 'success' &&
          ruleCharacters === 'success' && {
            labelInfo: passStrLabel,
          })}
      >
        <>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                isRequired
                type={isPasswordVisible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                arial-label={ariaLabel}
                placeholder={placeholder}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                onClick={togglePasswordVisibility}
                aria-label={
                  isPasswordVisible ? 'Show password' : 'Hide password'
                }
              >
                {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
              </Button>
            </InputGroupItem>
          </InputGroup>
        </>
        <FormHelperText>
          <HelperText component="ul">
            {environments.includes('azure') ? (
              <>
                <HelperTextItem variant={ruleLength} component="li" hasIcon>
                  A password for the target environment Azure must be at least 6
                  characters long. Please enter a longer password.
                </HelperTextItem>
                <HelperTextItem variant={ruleCharacters} component="li" hasIcon>
                  WARNING: This password seems weak, please use with caution or
                  include at least 3 of the following: lowercase letter,
                  uppercase letters, numbers, symbols
                </HelperTextItem>
              </>
            ) : (
              <HelperTextItem variant={ruleLength} component="li" hasIcon>
                Password helps protect your account, we recommend a password of
                at least 6 characters.
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </Form>
  );
};
