import React, { useMemo, useRef, useState } from 'react';

import {
  Divider,
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

import sortfn from '@/Utilities/sortfn';

type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  options: SearchableSelectOption[];
  selected?: string | undefined;
  placeholder?: string | undefined;
  searchPlaceholder?: string | undefined;
  onSelect: (value: string | undefined) => void;
  isFullWidth?: boolean;
};

const SearchableSelect = ({
  options,
  selected,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search by name',
  onSelect,
  isFullWidth = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(
    () => options.find((opt) => opt.value === selected)?.label,
    [options, selected],
  );

  const filteredOptions = useMemo(() => {
    if (!searchValue) {
      return options;
    }

    return options
      .filter((opt) =>
        opt.label.toLowerCase().includes(searchValue.toLowerCase()),
      )
      .sort((a, b) => sortfn(a.label, b.label, searchValue));
  }, [searchValue, options]);

  const handleSelect = (
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ) => {
    if (itemId && typeof itemId === 'string') {
      onSelect(itemId === selected ? undefined : itemId);
      setSearchValue('');
      setIsOpen(false);
    }
  };

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      {...(isFullWidth && {
        isFullWidth,
        style: { width: '100%', minWidth: '100%' },
      })}
    >
      <span
        style={{
          display: 'block',
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={selectedLabel || selected || undefined}
      >
        {selectedLabel || selected || placeholder}
      </span>
    </MenuToggle>
  );

  const menu = (
    <Menu
      ref={menuRef}
      onSelect={handleSelect}
      activeItemId={selected || ''}
      isScrollable
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            value={searchValue}
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            onChange={(_event, value) => setSearchValue(value)}
            onClear={(event) => {
              event.stopPropagation();
              setSearchValue('');
            }}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      <MenuContent maxMenuHeight='300px'>
        <MenuList>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <MenuItem
                key={option.value}
                itemId={option.value}
                isSelected={option.value === selected}
              >
                {option.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem isDisabled key='no-results'>
              {`No results found for "${searchValue}"`}
            </MenuItem>
          )}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <MenuContainer
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        if (!isOpen) {
          setSearchValue('');
        }
      }}
      onOpenChangeKeys={['Escape']}
    />
  );
};

export default SearchableSelect;
