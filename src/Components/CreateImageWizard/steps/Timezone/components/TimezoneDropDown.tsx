import React, { useMemo, useRef, useState } from 'react';

import {
  Divider,
  FormGroup,
  HelperText,
  HelperTextItem,
  Label,
  Menu,
  MenuContainer,
  MenuContent,
  MenuItem,
  MenuList,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  SearchInput,
} from '@patternfly/react-core';

import { changeTimezone, selectTimezone } from '@/store/slices/wizard';

import { DEFAULT_TIMEZONE } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useTimezoneValidation } from '../../../utilities/useValidation';
import { timezones } from '../timezonesList';

const TimezoneDropDown = () => {
  const timezone = useAppSelector(selectTimezone);
  const dispatch = useAppDispatch();

  const stepValidation = useTimezoneValidation();

  const [errorText, setErrorText] = useState(stepValidation.errors['timezone']);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (value: string) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setSearchValue(value);
  };

  const onSelect = (
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) => {
    if (itemId && typeof itemId === 'string') {
      dispatch(changeTimezone(itemId));
      setErrorText('');
      setSearchValue('');
      setIsOpen(false);
    }
  };

  const sortedTimezones = useMemo(() => {
    let filtered = timezones;

    if (searchValue) {
      const normalizedFilter = searchValue
        .toLowerCase()
        .replace(/[_/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      filtered = timezones.filter((tz) => {
        const normalizedTimezone = tz
          .toLowerCase()
          .replace(/[_/]/g, ' ')
          .replace(/\s+/g, ' ');
        return normalizedTimezone.includes(normalizedFilter);
      });
    }

    return [...filtered].sort((a, b) => {
      if (a === DEFAULT_TIMEZONE) return -1;
      if (b === DEFAULT_TIMEZONE) return 1;
      return 0;
    });
  }, [searchValue]);

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isFullWidth
      data-testid='timezone-toggle'
    >
      {timezone || 'Select a timezone'}
    </MenuToggle>
  );

  const menu = (
    <Menu
      ref={menuRef}
      onSelect={onSelect}
      activeItemId={timezone || ''}
      isScrollable
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            value={searchValue}
            aria-label='Filter timezone'
            onChange={(_event, value) => handleSearchChange(value)}
            onClear={(event) => {
              // prevents setIsOpen(isOpen) from closing the Wizard
              event.stopPropagation();
              handleSearchChange('');
            }}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      <MenuContent maxMenuHeight='300px'>
        <MenuList>
          {sortedTimezones.map((option) => (
            <MenuItem key={option} itemId={option}>
              {option}{' '}
              {option === DEFAULT_TIMEZONE && (
                <Label color='blue' isCompact>
                  Default
                </Label>
              )}
            </MenuItem>
          ))}
          {searchValue && sortedTimezones.length === 0 && (
            <MenuItem isDisabled key='no-results'>
              {`No results found for "${searchValue}"`}
            </MenuItem>
          )}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <FormGroup isRequired={false} label='Timezone'>
      <MenuContainer
        menu={menu}
        menuRef={menuRef}
        toggle={toggle}
        toggleRef={toggleRef}
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        onOpenChangeKeys={['Escape']}
      />
      {errorText && (
        <HelperText>
          <HelperTextItem variant={'error'}>{errorText}</HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default TimezoneDropDown;
