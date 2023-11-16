import React, { Dispatch, SetStateAction, useState } from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';

type ValidatedTextFieldPropType = {
  label: string;
  aria: string;
  fieldId: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  validateFunction: (value: string) => boolean;
  helperText: string;
};

/**
 * A text field in a FormGroup that does the validation of its content in order
 * to provide a visual clue to the user that an action is required. The clue
 * is only displayed if the user has entered some text.
 *
 * @param aria the aria-label for the inner TextInput
 * @param fieldId the html id for the inner TextInput
 * @param helperText the text to display when the input doesn't validate
 * @param label the FormGroup label
 * @param value set value the user types in the TextInput
 * @param setValue a function to update the value
 * @param validateFunction a function that takes a string as a parameter and
 * returns true if it meets some criteria.
 *
 * Follows the PF5 patterns found in
 * https://www.patternfly.org/components/forms/text-input
 */
const ValidatedTextField = ({
  aria,
  fieldId,
  helperText,
  label,
  value,
  setValue,
  validateFunction,
}: ValidatedTextFieldPropType) => {
  const [isValid, setIsValid] = useState(validateFunction(value));
  const validated = isValid || value.length === 0 ? 'default' : 'error';

  const handleTextInputChange = (
    _event: React.FormEvent<HTMLElement>,
    value: string
  ) => {
    setValue(value);
    setIsValid(validateFunction(value));
  };

  return (
    <FormGroup label={label} fieldId={fieldId} isRequired>
      <TextInput
        validated={validated}
        value={value}
        label={aria}
        aria-label={aria}
        onChange={handleTextInputChange}
      />
      <FormHelperText>
        <HelperTextItem>
          <HelperTextItem variant={validated}>
            {validated === 'error' ? helperText : ''}
          </HelperTextItem>
        </HelperTextItem>
      </FormHelperText>
    </FormGroup>
  );
};

export default ValidatedTextField;
