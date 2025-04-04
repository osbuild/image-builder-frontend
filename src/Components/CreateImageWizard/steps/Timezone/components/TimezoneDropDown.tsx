import React, { useEffect, useState } from 'react';

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  FormGroup,
} from '@patternfly/react-core';
import { HelperTextItem } from '@patternfly/react-core';
import { HelperText } from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeTimezone,
  selectTimezone,
} from '../../../../../store/wizardSlice';
import { useTimezoneValidation } from '../../../utilities/useValidation';
import { timezones } from '../timezonesList';

const TimezoneDropDown = () => {
  const timezone = useAppSelector(selectTimezone);
  const dispatch = useAppDispatch();

  const stepValidation = useTimezoneValidation();

  const [errorText, setErrorText] = useState(stepValidation.errors['timezone']);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<string[]>(timezones);

  useEffect(() => {
    let filteredTimezones = timezones;

    if (filterValue) {
      filteredTimezones = timezones.filter((timezone: string) =>
        String(timezone).toLowerCase().includes(filterValue.toLowerCase())
      );
      if (!isOpen) {
        setIsOpen(true);
      }
    }
    setSelectOptions(filteredTimezones);

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(!isOpen);
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onSelect = (_event: React.MouseEvent, value: string) => {
    if (value) {
      setInputValue(value);
      setFilterValue('');
      setErrorText('');
      dispatch(changeTimezone(value));
      setIsOpen(false);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    if (value !== timezone) {
      dispatch(changeTimezone(''));
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setInputValue('');
    setFilterValue('');
    setErrorText('');
    dispatch(changeTimezone(''));
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={timezone ? timezone : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete="off"
          placeholder="Select a timezone"
          isExpanded={isOpen}
        />

        {timezone && (
          <TextInputGroupUtilities>
            <Button
              icon={<TimesIcon />}
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input"
            />
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label="Timezone">
      <Select
        isScrollable
        isOpen={isOpen}
        selected={timezone}
        onSelect={onSelect}
        onOpenChange={onToggle}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {selectOptions.length > 0 ? (
            selectOptions.map((option) => (
              <SelectOption key={option} value={option}>
                {option}
              </SelectOption>
            ))
          ) : (
            <SelectOption isDisabled>
              {`No results found for "${filterValue}"`}
            </SelectOption>
          )}
        </SelectList>
      </Select>
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default TimezoneDropDown;
