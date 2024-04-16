import React, { useEffect, useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setStepInputValidation,
  selectInputValidation,
} from '../../store/wizardSlice';

interface ValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  helperText: string | undefined;
  validator: (value: string | undefined) => boolean;
  value: string;
  placeholder?: string;
}

interface StateValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  stepId: string;
  inputId: string;
  ariaLabel: string | undefined;
  helperText: string | undefined;
  validator: (value: string | undefined) => boolean;
  asyncValidator?: (
    value: string,
    callback: (isValid: boolean) => void
  ) => void;
  value: string;
  placeholder?: string;
}

export const StateValidatedInput = ({
  dataTestId,
  ouiaId,
  stepId,
  inputId,
  ariaLabel,
  helperText,
  validator,
  asyncValidator,
  value,
  placeholder,
  onChange,
}: StateValidatedTextInputPropTypes) => {
  const dispatch = useAppDispatch();
  const validatedState = useAppSelector(selectInputValidation(stepId, inputId));
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  // Do not surface validation on pristine state components
  const validated = isPristine ? 'default' : validatedState;

  const dispatchValidation = (isValid: boolean) => {
    dispatch(
      setStepInputValidation({
        stepId,
        inputId,
        isValid: isValid,
        errorText: isValid ? helperText : undefined,
      })
    );
  };

  // Debounce async validation
  // This needs the asyncValidator to be memoized to prevent multiple calls
  useEffect(() => {
    if (!asyncValidator || validator(value) === false) {
      return;
    }
    const timer = setTimeout(() => {
      asyncValidator(value, (asyncIsValid) => {
        dispatchValidation(asyncIsValid);
      });
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [value, asyncValidator]);

  const validate = (newVal: string) => {
    const isValid = validator(newVal);
    // When we have async validation, we let the debounce to handle it
    // skips the async validation if sync validation fails
    if (isValid && asyncValidator) {
      return;
    }
    dispatchValidation(isValid);
  };

  const handleBlur = () => {
    setIsPristine(false);
    validate(value);
  };

  const wrappedOnChange = (
    evt: React.FormEvent<HTMLInputElement>,
    newVal: string
  ) => {
    if (onChange) onChange(evt, newVal);
    validate(newVal);
  };

  return (
    <>
      <TextInput
        value={value}
        data-testid={dataTestId}
        ouiaId={ouiaId}
        type="text"
        onChange={wrappedOnChange}
        validated={validated}
        aria-label={ariaLabel}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {validated === 'error' && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            {helperText}
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
