import React from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';

import type { ValidationIssue } from '@/store/slices/wizard/types';

type ValidatedInputHelperTextProps = {
  errors: ValidationIssue[];
  id?: string;
  helperText?: React.ReactNode;
  variant?: 'error' | 'warning' | 'default';
};

export const ValidatedInputHelperText = ({
  errors,
  id,
  helperText,
  variant = 'error',
}: ValidatedInputHelperTextProps) => {
  if (errors.length === 0 && !helperText) {
    return null;
  }

  return (
    <HelperText {...(id !== undefined ? { id } : {})}>
      {errors.length > 0 ? (
        errors.map((issue, index) => (
          <HelperTextItem
            key={`${issue.value ?? ''}-${issue.message}-${index}`}
            variant={variant}
          >
            {issue.message}
          </HelperTextItem>
        ))
      ) : (
        <HelperTextItem>{helperText}</HelperTextItem>
      )}
    </HelperText>
  );
};
