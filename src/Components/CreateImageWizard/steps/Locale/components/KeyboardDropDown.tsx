import React, { useMemo } from 'react';

import { FormGroup } from '@patternfly/react-core';

import ValidatedInputHelperText from '@/Components/CreateImageWizard/ValidatedInputHelperText';
import SearchableSelect from '@/Components/sharedComponents/SearchableSelect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeKeyboard,
  keyboards,
  selectKeyboard,
  validateKeyboard,
} from '@/store/slices/wizard';

const KeyboardDropDown = () => {
  const dispatch = useAppDispatch();
  const keyboard = useAppSelector(selectKeyboard);
  const errors = validateKeyboard(keyboard);

  const options = useMemo(
    () => keyboards.map((kb) => ({ value: kb, label: kb })),
    [],
  );

  const handleSelect = (value: string | undefined) => {
    dispatch(changeKeyboard(value ?? ''));
  };

  return (
    <FormGroup isRequired={false} label='Keyboard' role='group'>
      <SearchableSelect
        options={options}
        selected={keyboard}
        placeholder='Select a keyboard'
        onSelect={handleSelect}
      />
      <ValidatedInputHelperText errors={errors} />
    </FormGroup>
  );
};

export default KeyboardDropDown;
