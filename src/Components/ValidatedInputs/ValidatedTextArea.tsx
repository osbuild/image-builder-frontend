import React, { useEffect, useId, useState } from 'react';

import { TextArea, TextAreaProps } from '@patternfly/react-core';

import { useAppDispatch } from '@/store/hooks';
import {
  addPendingInput,
  removePendingInput,
  type ValidationResult,
} from '@/store/slices/wizard';

import { ValidatedInputHelperText } from './ValidatedInputHelperText';

type ValidatedTextAreaProps = Omit<
  TextAreaProps,
  'value' | 'type' | 'ref' | 'onBlur'
> & {
  value: string;
  ariaLabel: string;
  validator: (value: string) => ValidationResult<string>;
  onCommit: (data: string | undefined) => void;
  onClear?: () => void;
  helperText?: React.ReactNode;
  showErrors?: boolean;
  isDisabled?: boolean;
};

export const ValidatedTextArea = ({
  value,
  ariaLabel,
  validator,
  onCommit,
  helperText,
  showErrors = false,
  isDisabled = false,
  onChange,
  onClear,
  onFocus,
  ...props
}: ValidatedTextAreaProps) => {
  const helperTextId = useId();
  const dispatch = useAppDispatch();
  const [isPristine, setIsPristine] = useState(value === '');

  useEffect(() => {
    return () => {
      dispatch(removePendingInput(helperTextId));
    };
  }, [dispatch, helperTextId]);
  const { errors, warnings = [] } = validator(value);

  const showValidationErrors = !isPristine || showErrors;
  const displayedErrors = showValidationErrors ? errors : [];

  const handleBlur = () => {
    setIsPristine(false);

    if (!value.trim() && onClear) {
      onClear();
      dispatch(removePendingInput(helperTextId));
      return;
    }

    const result = validator(value);
    // NOTE: A duplicate is a conflict between committed values, not a bad value.
    // Commit it so slice validation can report it and either row can resolve it.
    const blocking = result.errors.filter(
      (issue) => issue.kind !== 'duplicate',
    );

    if (blocking.length === 0) {
      onCommit(result.data);
      dispatch(removePendingInput(helperTextId));
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
      <TextArea
        {...props}
        value={value}
        onFocus={onFocus}
        onChange={(event, nextValue) => {
          if (nextValue !== value) {
            dispatch(addPendingInput(helperTextId));
          }
          onChange?.(event, nextValue);
        }}
        validated={validated}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        isDisabled={isDisabled}
        aria-invalid={displayedErrors.length > 0 || undefined}
        aria-describedby={
          validationIssues.length > 0 || Boolean(helperText)
            ? helperTextId
            : undefined
        }
      />
      <ValidatedInputHelperText
        id={helperTextId}
        errors={validationIssues}
        helperText={helperText}
        variant={validated}
      />
    </>
  );
};
