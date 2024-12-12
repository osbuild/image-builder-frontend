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
  ariaLabel: string | undefined;
  value: string;
  placeholder?: string;
  stepValidation: StepValidation;
  fieldName: string;
  isEmpty: boolean;
}

interface HookValidatedTextInputWithButtonPropTypes
  extends HookValidatedTextInputPropTypes {
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
        ouiaId={ouiaId || ''}
        type={type}
        onChange={onChange!}
        validated={validated}
        aria-label={ariaLabel || ''}
        onBlur={handleBlur}
        placeholder={placeholder || ''}
        isDisabled={isDisabled || false}
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

// Lucas I tried to write a wrapper function that reuse as much as I can the exciting code,
// and there is a bug with that code - the error message appears on the right side instead of under the input.
export const HookValidatedInputWithPasswordVisibilityButton1 = (
  props: HookValidatedTextInputWithButtonPropTypes
) => {
  const { togglePasswordVisibility, isPasswordVisible, ...restProps } = props;
  return (
    <>
      <div
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <HookValidatedInput {...restProps} style={{ paddingRight: '2rem' }} />
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
      {restProps.validated === 'error' && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {restProps.stepValidation.errors[restProps.fieldName]}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

// this function also reuse some of the code and works as it should be -
// error message appears under the input
export const HookValidatedInputWithPasswordVisibilityButton = (
  props: HookValidatedTextInputWithButtonPropTypes
) => {
  const { togglePasswordVisibility, isPasswordVisible, ...restProps } = props;
  const [isPristine, setIsPristine] = useState(!restProps.value ? true : false);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated = restProps.isEmpty
    ? 'default'
    : isPristine
    ? 'default'
    : restProps.stepValidation.errors[restProps.fieldName] === 'default'
    ? 'default'
    : restProps.stepValidation.errors[restProps.fieldName]
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
          value={restProps.value}
          data-testid={restProps.dataTestId}
          onChange={restProps.onChange!}
          ouiaId={restProps.ouiaId || ''}
          aria-label={restProps.ariaLabel || ''}
          validated={validated}
          type={restProps.type || 'text'}
          placeholder={restProps.placeholder || ''}
          onBlur={handleBlur}
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
            {restProps.stepValidation.errors[restProps.fieldName]}
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
        ouiaId={ouiaId || ''}
        type="text"
        onChange={onChange!}
        validated={handleValidation()}
        aria-label={ariaLabel || ''}
        onBlur={handleBlur}
        placeholder={placeholder || ''}
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
  isEmpty,
}: HookValidatedTextAreaPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed
  const validated = isEmpty
    ? 'default'
    : isDisabled
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
        aria-label={ariaLabel || ''}
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
