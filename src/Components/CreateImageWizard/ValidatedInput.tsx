import React, { useEffect, useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  TextArea,
  TextAreaProps,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

import type { StepValidation } from './utilities/useValidation';

type ValidatedTextInputPropTypes = TextInputProps & {
  dataTestId?: string;
  ouiaId?: string;
  ariaLabel: string | undefined;
  helperText: string | undefined;
  validator: (value: string | undefined) => boolean;
  value: string;
  placeholder?: string;
};

type ValidationInputProp = TextInputProps &
  TextAreaProps & {
    value: string;
    placeholder: string;
    stepValidation: StepValidation;
    dataTestId?: string;
    fieldName: string;
    inputType?: 'textInput' | 'textArea';
    ariaLabel: string;
    onChange: (
      event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      value: string
    ) => void;
    isRequired?: boolean;
    warning?: string;
  };

type ErrorMessageProps = {
  errorMessage: string;
};

type ValidationResult = 'default' | 'success' | 'error';

export const ValidatedInputAndTextArea = ({
  value,
  stepValidation,
  fieldName,
  placeholder,
  dataTestId,
  onChange,
  ariaLabel,
  inputType = 'textInput',
  isRequired,
  warning = undefined,
}: ValidationInputProp) => {
  const errorMessage = stepValidation.errors[fieldName] || '';
  const hasError = errorMessage !== '';

  const [isPristine, setIsPristine] = useState(!value);
  const validated = getValidationState(isPristine, errorMessage, isRequired);

  const handleBlur = () => {
    if (value) {
      setIsPristine(false);
    }
  };

  useEffect(() => {
    if (!value) {
      setIsPristine(true);
    }
  }, [value, setIsPristine]);

  return (
    <>
      {inputType === 'textArea' ? (
        <TextArea
          value={value}
          onChange={onChange}
          validated={validated}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          data-testid={dataTestId}
        />
      ) : (
        <TextInput
          value={value}
          onChange={onChange}
          validated={validated}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          data-testid={dataTestId}
        />
      )}
      {warning !== undefined && warning !== '' && (
        <HelperText>
          <HelperTextItem variant="warning" hasIcon>
            {warning}
          </HelperTextItem>
        </HelperText>
      )}
      {hasError && <ErrorMessage errorMessage={errorMessage} />}
    </>
  );
};

const getValidationState = (
  isPristine: boolean,
  errorMessage: string,
  isRequired: boolean | undefined
): ValidationResult => {
  const validated = isPristine
    ? 'default'
    : (isRequired && errorMessage) || errorMessage
    ? 'error'
    : 'success';

  return validated;
};

export const ErrorMessage = ({ errorMessage }: ErrorMessageProps) => {
  return (
    <HelperText>
      <HelperTextItem variant="error" hasIcon>
        {errorMessage}
      </HelperTextItem>
    </HelperText>
  );
};

export const ValidatedInput = ({
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
