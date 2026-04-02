import React, { useEffect, useState } from 'react';

import {
  Button,
  HelperText,
  HelperTextItem,
  TextArea,
  TextAreaProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupMainProps,
  TextInputGroupUtilities,
  TextInputProps,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import type { StepValidation } from './utilities/useValidation';

type ValidatedTextInputPropTypes = Omit<
  TextInputGroupMainProps,
  'value' | 'type' | 'onBlur' | 'ref'
> & {
  helperText: string | undefined;
  validator: (value: string | undefined) => boolean;
  value: string;
  handleClear: () => void;
};

type ValidationInputProp = TextInputProps &
  TextAreaProps & {
    value: string;
    placeholder?: string;
    stepValidation: StepValidation;
    dataTestId?: string;
    fieldName: string;
    inputType?: 'textInput' | 'textArea';
    ariaLabel: string;
    onChange: (
      event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      value: string,
    ) => void;
    isRequired?: boolean;
    warning?: string | undefined;
    forceErrorDisplay?: boolean;
    isDisabled?: boolean;
    handleClear?: () => void;
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
  isDisabled = false,
  warning = undefined,
  forceErrorDisplay = false,
  handleClear,
}: ValidationInputProp) => {
  const errorMessage = stepValidation.errors[fieldName] || '';
  const hasError = errorMessage !== '';

  const [isPristine, setIsPristine] = useState(!value);
  const validated = getValidationState(
    isPristine,
    errorMessage,
    isRequired,
    forceErrorDisplay,
  );

  const handleBlur = () => {
    if (value) {
      setIsPristine(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setIsPristine(false);
    }
    if (isDisabled) {
      setIsPristine(true);
    }
    if (value === '' && !errorMessage) {
      setIsPristine(true);
    }
  }, [value, errorMessage, isDisabled]);

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
          isDisabled={isDisabled}
        />
      ) : (
        <TextInputGroup
          {...(validated === 'error' && { validated })}
          isDisabled={isDisabled}
        >
          <TextInputGroupMain
            value={value}
            type='text'
            onBlur={handleBlur}
            onChange={onChange}
            placeholder={placeholder || ''}
            aria-label={ariaLabel}
            data-testid={dataTestId}
          />
          {value && handleClear && (
            <TextInputGroupUtilities>
              <Button
                variant='plain'
                onClick={handleClear}
                aria-label={
                  ariaLabel ? `Clear ${ariaLabel} input` : 'Clear input'
                }
                icon={<TimesIcon />}
                tabIndex={-1} // Remove from tab order to maintain clean keyboard navigation between fields
              />
            </TextInputGroupUtilities>
          )}
        </TextInputGroup>
      )}
      {warning !== undefined && warning !== '' && (
        <HelperText>
          <HelperTextItem variant='warning'>{warning}</HelperTextItem>
        </HelperText>
      )}
      {validated === 'error' && hasError && (
        <HelperText>
          <HelperTextItem variant='error'>{errorMessage}</HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

const getValidationState = (
  isPristine: boolean,
  errorMessage: string,
  isRequired: boolean | undefined,
  forceErrorDisplay: boolean,
): ValidationResult => {
  if (forceErrorDisplay && errorMessage) {
    return 'error';
  }

  const validated = isPristine
    ? 'default'
    : (isRequired && errorMessage) || errorMessage
      ? 'error'
      : 'success';

  return validated;
};

export const ValidatedInput = ({
  helperText,
  validator,
  value,
  handleClear,
  ...props
}: ValidatedTextInputPropTypes) => {
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  const ariaLabel = props['aria-label'];

  const handleBlur = () => {
    setIsPristine(false);
  };

  const validated = isPristine
    ? undefined
    : validator(value)
      ? 'success'
      : 'error';

  return (
    <>
      <TextInputGroup {...(validated === 'error' && { validated })}>
        <TextInputGroupMain
          value={value}
          type='text'
          onBlur={handleBlur}
          {...props}
        />
        {value && (
          <TextInputGroupUtilities>
            <Button
              variant='plain'
              onClick={handleClear}
              aria-label={
                ariaLabel ? `Clear ${ariaLabel} input` : 'Clear input'
              }
              icon={<TimesIcon />}
              tabIndex={-1} // Remove from tab order to maintain clean keyboard navigation between fields
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
      {!isPristine && !validator(value) && (
        <HelperText>
          <HelperTextItem variant='error'>{helperText}</HelperTextItem>
        </HelperText>
      )}
    </>
  );
};
