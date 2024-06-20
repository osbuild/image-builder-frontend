import React, { useState } from 'react';

import { HelperText } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { TextInput } from '@patternfly/react-core/dist/dynamic/components/TextInput';
import { TextInputProps } from '@patternfly/react-core/dist/dynamic/components/TextInput';

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
  value,
  placeholder,
  onChange,
}: StateValidatedTextInputPropTypes) => {
  const dispatch = useAppDispatch();
  const validatedState = useAppSelector(selectInputValidation(stepId, inputId));
  const [isPristine, setIsPristine] = useState(!value ? true : false);
  // Do not surface validation on pristine state components
  const validated = isPristine ? 'default' : validatedState;

  const handleBlur = () => {
    setIsPristine(false);
    const isValid = validator(value);
    dispatch(
      setStepInputValidation({
        stepId,
        inputId,
        isValid,
        errorText: isValid ? helperText : undefined,
      })
    );
  };

  const wrappedOnChange = (
    evt: React.FormEvent<HTMLInputElement>,
    newVal: string
  ) => {
    if (onChange) onChange(evt, newVal);
    const isValid = validator(newVal);
    dispatch(
      setStepInputValidation({
        stepId,
        inputId,
        isValid,
        errorText: isValid ? helperText : undefined,
      })
    );
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
