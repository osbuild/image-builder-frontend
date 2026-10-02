import React from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';

import type { ValidationIssue } from '@/store/slices/wizard';

type ValidatedInputHelperTextProps = {
  errors: ValidationIssue[];
  warnings?: ValidationIssue[];
  id?: string;
  helperText?: React.ReactNode;
  variant?: 'error' | 'warning' | 'default';
};

export const ValidatedInputHelperText = ({
  errors,
  warnings = [],
  id,
  helperText,
  variant = 'error',
}: ValidatedInputHelperTextProps) => {
  if (errors.length === 0 && warnings.length === 0 && !helperText) {
    return null;
  }

  const helperId = id !== undefined ? { id } : {};

  if (errors.length > 0) {
    return (
      <HelperText {...helperId}>
        {errors.map((issue, index) => (
          <HelperTextItem
            key={`${issue.value ?? ''}-${issue.message}-${index}`}
            variant={variant}
          >
            {issue.message}
          </HelperTextItem>
        ))}
      </HelperText>
    );
  }

  if (warnings.length > 0) {
    return (
      <HelperText {...helperId}>
        {warnings.map((issue, index) => (
          <HelperTextItem
            key={`${issue.value ?? ''}-${issue.message}-${index}`}
            variant={'warning'}
          >
            {issue.message}
          </HelperTextItem>
        ))}
      </HelperText>
    );
  }

  return (
    <HelperText {...helperId}>
      <HelperTextItem>{helperText}</HelperTextItem>
    </HelperText>
  );
};
