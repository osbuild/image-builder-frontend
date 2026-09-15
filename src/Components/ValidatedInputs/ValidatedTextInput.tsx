import React, { useId, useState } from 'react';

import {
  Button,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupMainProps,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import type { ValidationResult } from '@/store/slices/wizard/types';

import { ValidatedInputHelperText } from './ValidatedInputHelperText';

type ValidatedTextInputProps<T> = Omit<
  TextInputGroupMainProps,
  'value' | 'type' | 'ref' | 'onBlur'
> & {
  value: string;
  ariaLabel: string;
  validator: (value: string) => ValidationResult<T>;
  onCommit: (data: T | undefined) => void;
  helperText?: React.ReactNode;
  showErrors?: boolean;
  handleClear?: () => void;
  clearButtonAriaLabel?: string;
  isDisabled?: boolean;
};

export const ValidatedTextInput = <T,>({
  value,
  ariaLabel,
  validator,
  onCommit,
  helperText,
  showErrors = false,
  handleClear,
  clearButtonAriaLabel = 'Clear input',
  isDisabled = false,
  inputProps,
  ...props
}: ValidatedTextInputProps<T>) => {
  const helperTextId = useId();
  const [isPristine, setIsPristine] = useState(value === '');
  const { errors, warnings = [] } = validator(value);

  const showValidationErrors = !isPristine || showErrors;
  const displayedErrors = showValidationErrors ? errors : [];

  const handleBlur = () => {
    setIsPristine(false);

    const result = validator(value);
    if (result.errors.length === 0) {
      onCommit(result.data);
    }
  };

  let validated: 'default' | 'warning' | 'error' = 'default';
  let validationIssues = warnings;

  if (warnings.length > 0) {
    validated = 'warning';
  }

  if (displayedErrors.length > 0) {
    validated = 'error';
    validationIssues = displayedErrors;
  }

  return (
    <>
      <TextInputGroup validated={validated} isDisabled={isDisabled}>
        <TextInputGroupMain
          {...props}
          value={value}
          aria-label={ariaLabel}
          type='text'
          onBlur={handleBlur}
          inputProps={{
            ...inputProps,
            'aria-describedby': helperTextId,
            'aria-invalid': displayedErrors.length > 0 || undefined,
          }}
        />
        {value && handleClear && (
          <TextInputGroupUtilities>
            <Button
              variant='plain'
              onClick={handleClear}
              aria-label={clearButtonAriaLabel}
              icon={<TimesIcon />}
              tabIndex={-1}
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
      <ValidatedInputHelperText
        id={helperTextId}
        errors={validationIssues}
        helperText={helperText}
        variant={validated}
      />
    </>
  );
};
