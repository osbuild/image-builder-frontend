import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  HelperText,
  HelperTextItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';

import { DEFAULT_TIMEZONE } from '../../../../../constants';
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
      const normalizedFilter = filterValue
        .toLowerCase()
        .replace(/[_/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      filteredTimezones = timezones.filter((timezone: string) => {
        const normalizedTimezone = timezone
          .toLowerCase()
          .replace(/[_/]/g, ' ')
          .replace(/\s+/g, ' ');
        return normalizedTimezone.includes(normalizedFilter);
      });

      if (!isOpen) {
        setIsOpen(true);
      }
    }

    const sortedTimezones = [...filteredTimezones].sort((a, b) => {
      if (a === DEFAULT_TIMEZONE) return -1;
      if (b === DEFAULT_TIMEZONE) return 1;
      return 0;
    });

    setSelectOptions(sortedTimezones);

    // This useEffect hook should run *only* on when the filter value changes.
    // eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      setIsOpen(false);
    }
  };

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (value && typeof value === 'string') {
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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant='typeahead'
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={timezone ? timezone : inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          placeholder='Select a timezone'
          isExpanded={isOpen}
        />
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label='Timezone'>
      <Select
        isScrollable
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        selected={timezone}
        onSelect={onSelect}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {selectOptions.length > 0 ? (
            selectOptions.map((option) => (
              <SelectOption key={option} value={option}>
                {option}{' '}
                {option === DEFAULT_TIMEZONE && (
                  <Label color='blue' isCompact>
                    Default
                  </Label>
                )}
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
