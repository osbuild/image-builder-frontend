import React, { useMemo, useState } from 'react';

import { FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';

import { changeKeyboard, selectKeyboard } from '@/store/slices/wizard';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import SearchableSelect from '../../../../sharedComponents/SearchableSelect';
import { useLocaleValidation } from '../../../utilities/useValidation';
import { keyboardsList } from '../data/keyboardsList';

const KeyboardDropDown = () => {
  const keyboard = useAppSelector(selectKeyboard);
  const dispatch = useAppDispatch();

  const stepValidation = useLocaleValidation();

  const [errorText, setErrorText] = useState(stepValidation.errors['keyboard']);

  const options = useMemo(
    () => keyboardsList.map((kb) => ({ value: kb, label: kb })),
    [],
  );

  const handleSelect = (value: string | undefined) => {
    dispatch(changeKeyboard(value ?? ''));
    setErrorText('');
  };

  return (
    <FormGroup isRequired={false} label='Keyboard' role='group'>
      <SearchableSelect
        options={options}
        selected={keyboard}
        placeholder='Select a keyboard'
        onSelect={handleSelect}
      />
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default KeyboardDropDown;
