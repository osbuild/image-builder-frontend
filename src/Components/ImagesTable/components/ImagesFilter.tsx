import React, { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { filterOptions } from '../constants';

type ImagesFilterProps = {
  filterCategory: string;
  setFilterCategory: (category: string) => void;
};

const ImagesFilter = ({
  filterCategory,
  setFilterCategory,
}: ImagesFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    value?: string,
  ) => {
    if (value === undefined) return;

    setFilterCategory(value);
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={onSelect}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<FilterIcon />}
        >
          {
            filterOptions.find((option) => option.value === filterCategory)
              ?.label
          }
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        {filterOptions.map((option) => (
          <DropdownItem
            value={option.value}
            key={option.value}
            isSelected={filterCategory === option.value}
          >
            {option.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default ImagesFilter;
