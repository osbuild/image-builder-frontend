import React, { useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

interface ValidatedTextInputPropTypes extends TextInputProps {
  dataTestId?: string | undefined;
  ouiaId?: string;
  ariaLabel: string | undefined;
  helperText: string | undefined;
  validator: (value: string | undefined) => Boolean;
  value: string;
  placeholder?: string;
}

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
