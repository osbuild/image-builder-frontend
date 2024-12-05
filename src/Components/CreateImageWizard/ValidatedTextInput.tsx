import React, { ChangeEvent, useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  TextInput,
  TextInputProps,
  Button,
  TextAreaProps,
  TextArea,
} from '@patternfly/react-core';
import { EyeSlashIcon, EyeIcon } from '@patternfly/react-icons';

import type { StepValidation } from './utilities/useValidation';

interface ValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  helperText: string | undefined;
  validator: (value: string | undefined) => boolean;
  value: string;
  placeholder?: string;
}

interface HookValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  value: string;
  placeholder?: string;
  stepValidation: StepValidation;
  fieldName: string;
  warning?: string;
}

interface HookValidatedTextAreaPropTypes extends TextAreaProps {
  dataTestId?: string | undefined;
  ariaLabel?: string;
  value: string;
  placeholder?: string;
  stepValidation: StepValidation;
  fieldName: string;
}

interface HookValidatedTextInputWithButtonPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  value: string;
  placeholder?: string;
  stepValidation: StepValidation;
  fieldName: string;
  togglePasswordVisibility: () => void;
  isPasswordVisible: boolean;
  isEmpty: boolean;
}

export const HookValidatedInput = ({
  dataTestId,
  ouiaId,
  ariaLabel,
  value,
  isDisabled,
  placeholder,
  onChange,
  stepValidation,
  fieldName,
  type = 'text',
  warning = undefined,
}: HookValidatedTextInputPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated = isPristine
    ? 'default'
    : stepValidation.errors[fieldName] === 'default'
    ? 'default'
    : stepValidation.errors[fieldName]
    ? 'error'
    : 'success';

  const handleBlur = () => {
    setIsPristine(false);
  };

  return (
    <>
      <TextInput
        value={value}
        data-testid={dataTestId}
        ouiaId={ouiaId}
        type={type}
        onChange={onChange}
        validated={validated}
        aria-label={ariaLabel}
        onBlur={handleBlur}
        placeholder={placeholder}
        isDisabled={isDisabled}
      />
      {validated === 'error' && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {stepValidation.errors[fieldName]}
          </HelperTextItem>
        </HelperText>
      )}
      {warning !== undefined && (
        <HelperText>
          <HelperTextItem variant="warning" hasIcon>
            {warning}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export const HookValidatedInputWithButton = ({
  dataTestId,
  ouiaId,
  ariaLabel,
  value,
  placeholder,
  onChange,
  stepValidation,
  fieldName,
  type = 'text',
  isEmpty,
  togglePasswordVisibility,
  isPasswordVisible,
}: HookValidatedTextInputWithButtonPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated = isEmpty
    ? 'default'
    : isPristine
    ? 'default'
    : stepValidation.errors[fieldName] === 'default'
    ? 'default'
    : stepValidation.errors[fieldName]
    ? 'error'
    : 'success';

  const handleBlur = () => {
    setIsPristine(false);
  };
  return (
    <>
      <div
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <TextInput
          value={value}
          data-testid={dataTestId}
          ouiaId={ouiaId}
          type={type}
          onChange={onChange}
          validated={validated}
          aria-label={ariaLabel}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{ paddingRight: '2rem' }}
        />
        <Button
          variant="plain"
          onClick={togglePasswordVisibility}
          aria-label="Toggle password visibility"
          style={{
            position: 'absolute',
            right: '0.5rem',
          }}
        >
          {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
        </Button>
      </div>
      {validated === 'error' && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {stepValidation.errors[fieldName]}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export const ValidatedTextInput = ({
  dataTestId,
  ouiaId,
  ariaLabel,
  helperText,
  validator,
  value,
  placeholder,
  onChange,
}: ValidatedTextInputPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);

  const handleBlur = () => {
    setIsPristine(false);
  };

  const handleValidation = () => {
    // Prevent premature validation during user's first entry
    if (isPristine) {
      return 'default';
    }
    return validator(value) ? 'success' : 'error';
  };

  return (
    <>
      <TextInput
        value={value}
        data-testid={dataTestId}
        ouiaId={ouiaId}
        type="text"
        onChange={onChange}
        validated={handleValidation()}
        aria-label={ariaLabel}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {!isPristine && !validator(value) && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {helperText}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export const HookValidatedTextArea = ({
  dataTestId,
  ariaLabel,
  value,
  placeholder,
  onChange,
  stepValidation,
  fieldName,
  type = 'text',
  isDisabled = false,
}: HookValidatedTextAreaPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated = isDisabled
    ? 'default'
    : isPristine
    ? 'default'
    : stepValidation.errors[fieldName] === 'default'
    ? 'default'
    : stepValidation.errors[fieldName]
    ? 'error'
    : 'success';

  const handleBlur = () => {
    setIsPristine(false);
  };
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event, event.target.value);
    }
  };

  return (
    <>
      <TextArea
        value={value}
        data-testid={dataTestId}
        type={type}
        onChange={handleChange}
        validated={validated}
        aria-label={ariaLabel}
        onBlur={handleBlur}
        placeholder={placeholder}
        isDisabled={isDisabled}
      />
      {validated === 'error' && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {stepValidation.errors[fieldName]}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};
