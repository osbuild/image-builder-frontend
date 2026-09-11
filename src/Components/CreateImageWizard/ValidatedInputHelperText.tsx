import React from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';

import type { ValidationResult } from '@/store/slices/wizard/types';

type ValidatedInputHelperTextProps = {
  errors: ValidationResult;
  id?: string;
  helperText?: React.ReactNode;
};

const ValidatedInputHelperText = ({
  errors,
  id,
  helperText,
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
            variant='error'
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

export default ValidatedInputHelperText;
