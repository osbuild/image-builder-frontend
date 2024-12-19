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

const getValidationState = (
  value: string,
  stepValidation: StepValidation,
  fieldName: string,
  isPristine: boolean,
  isEmpty?: boolean
): 'default' | 'error' | 'success' => {
  if (isEmpty) return 'default';
  if (isPristine) return 'default';
  if (stepValidation.errors[fieldName] === 'default') return 'default';
  return stepValidation.errors[fieldName] ? 'error' : 'success';
};

const ErrorHelperText = ({
  errorMessage,
}: {
  errorMessage?: string | undefined;
}) => {
  if (!errorMessage) return null;

  return (
    <HelperText>
      <HelperTextItem variant="error" hasIcon>
        {errorMessage}
      </HelperTextItem>
    </HelperText>
  );
};

const usePristineState = (initialValue: string) => {
  const [isPristine, setIsPristine] = useState(!initialValue);

  const handleBlur = () => {
    setIsPristine(false);
  };

  return { isPristine, handleBlur };
};

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
  const { isPristine, handleBlur } = usePristineState(value);
  // Do not surface validation on pristine state components
  // Allow step validation to be set on pristine state, when needed

  const errorMessage =
    !isPristine && stepValidation.errors[fieldName]
      ? stepValidation.errors[fieldName]
      : undefined;

  const validationState = getValidationState(
    value,
    stepValidation,
    fieldName,
    isPristine
  );

  return (
    <>
      <TextInput
        value={value}
        data-testid={dataTestId}
        ouiaId={ouiaId || ''}
        type={type}
        onChange={onChange!}
        validated={validationState}
        aria-label={ariaLabel || ''}
        onBlur={handleBlur}
        placeholder={placeholder || ''}
        isDisabled={isDisabled || false}
      />
      <ErrorHelperText errorMessage={errorMessage} />
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

export const HookValidatedInputWithPasswordVisibilityButton = (
  props: HookValidatedTextInputWithButtonPropTypes
) => {
  const { togglePasswordVisibility, isPasswordVisible, ...restProps } = props;
  const { isPristine, handleBlur } = usePristineState(restProps.value);

  const errorMessage =
    !isPristine && restProps.stepValidation.errors[restProps.fieldName]
      ? restProps.stepValidation.errors[restProps.fieldName]
      : undefined;

  const validationState = getValidationState(
    restProps.value,
    restProps.stepValidation,
    restProps.fieldName,
    isPristine
  );
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
          validated={validationState}
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
      <ErrorHelperText errorMessage={errorMessage} />
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
  const { isPristine, handleBlur } = usePristineState(value);

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
  const { isPristine, handleBlur } = usePristineState(value);
  const validationState = getValidationState(
    value,
    stepValidation,
    fieldName,
    isPristine,
    isEmpty
  );
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event, event.target.value);
    }
  };
  const errorMessage =
    !isPristine && stepValidation.errors[fieldName]
      ? stepValidation.errors[fieldName]
      : undefined;

  return (
    <>
      <TextArea
        value={value}
        data-testid={dataTestId}
        type={type}
        onChange={handleChange}
        validated={validationState}
        aria-label={ariaLabel || ''}
        onBlur={handleBlur}
        placeholder={placeholder}
        isDisabled={isDisabled}
      />
      <ErrorHelperText errorMessage={errorMessage} />
    </>
  );
};
