import React, { useState } from 'react';

import {
  HelperText,
  HelperTextItem,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';

interface ValidatedTextInputPropTypes extends TextInputProps {
  validator: (value: string | undefined) => Boolean;
  value: string | undefined;
}

export const ValidatedTextInput = ({
  validator,
  value,
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
        type="text"
        onChange={onChange}
        validated={handleValidation()}
        aria-label="TODO"
        onBlur={handleBlur}
      />
      {!isPristine && !validator(value) && (
        <HelperText>
          <HelperTextItem variant="error" hasIcon>
            This is error helper text
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};
