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

import { useAppSelector } from '../../../store/hooks';
import { selectImageTypes } from '../../../store/wizardSlice';
import { validatePassword } from '../../../Schemas/User/Password';

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

  const validationState = validatePassword(value);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isEditingWithoutValue = hasPassword && !value;

  const PasswordToggleButton = () => {
    return (
      <Button
        variant='control'
        onClick={togglePasswordVisibility}
        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
        isDisabled={isEditingWithoutValue}
      >
        {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
      </Button>
    );
  };

  return (
    <FormGroup label='Password' className='pf-v6-u-pb-md'>
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
            {isEditingWithoutValue ? (
              <Tooltip content='Passwords cannot be viewed when editing a blueprint for security reasons'>
                <span>
                  <PasswordToggleButton />
                </span>
              </Tooltip>
            ) : (
              <PasswordToggleButton />
            )}
          </InputGroupItem>
        </InputGroup>
      </>
      <FormHelperText>
        <HelperText component='ul'>
          {false && (
            <HelperTextItem variant={'indeterminate'} component='li'>
              Password must be at least 6 characters long
            </HelperTextItem>
          )}
          {validationState.map((error) => (
            <HelperTextItem variant={'error'} component='li'>
              {error}
            </HelperTextItem>
          ))}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
