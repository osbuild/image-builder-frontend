import React, { useState } from 'react';

import {
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';

import { simpleTargetNames } from '@/constants';
import type { BootcDistributionItem } from '@/store/api/backend';
import { isImageType } from '@/store/slices/wizard';

import './OnPrem.css';

type ImageSelectProps = {
  items: BootcDistributionItem[];
  selectedRef: string | undefined;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  getLabel: (item: BootcDistributionItem) => string;
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  ariaDescribedBy?: string | undefined;
};

const toggleStyle = {
  minWidth: '20rem',
  maxWidth: '100%',
} as React.CSSProperties;

const ImageSelect = ({
  items,
  selectedRef,
  onSelect,
  getLabel,
  placeholder = 'Select an image',
  isLoading = false,
  isDisabled = false,
  isSearchable = false,
  ariaDescribedBy,
}: ImageSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // null = not filtering (show selected label), string = user is typing
  const [filterValue, setFilterValue] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.reference === selectedRef);

  const filteredItems =
    isSearchable && filterValue
      ? items.filter((item) =>
          getLabel(item).toLowerCase().includes(filterValue.toLowerCase()),
        )
      : items;

  const handleSelect = (
    event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    onSelect(event, selection);
    setFilterValue(null);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFilterValue(null);
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    if (isLoading) {
      return (
        <MenuToggle
          ref={toggleRef}
          isDisabled
          style={toggleStyle}
          aria-describedby={ariaDescribedBy}
        >
          <Spinner size='sm' aria-hidden='true' /> Loading images...
        </MenuToggle>
      );
    }

    if (isSearchable) {
      const inputValue =
        filterValue !== null
          ? filterValue
          : selectedItem
            ? getLabel(selectedItem)
            : '';

      return (
        <MenuToggle
          ref={toggleRef}
          variant='typeahead'
          onClick={() => setIsOpen((prev) => !prev)}
          isExpanded={isOpen}
          isDisabled={isDisabled}
          style={toggleStyle}
          aria-describedby={ariaDescribedBy}
        >
          <TextInputGroup isPlain>
            <TextInputGroupMain
              value={inputValue}
              onClick={() => setIsOpen((prev) => !prev)}
              onChange={(_event, value) => {
                setFilterValue(value);
                if (!isOpen) {
                  setIsOpen(true);
                }
              }}
              autoComplete='off'
              placeholder={placeholder}
            />
          </TextInputGroup>
        </MenuToggle>
      );
    }

    return (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsOpen((prev) => !prev)}
        isExpanded={isOpen}
        isDisabled={isDisabled}
        style={toggleStyle}
        aria-describedby={ariaDescribedBy}
      >
        {selectedItem ? getLabel(selectedItem) : placeholder}
      </MenuToggle>
    );
  };

  return (
    <div className='pf-v6-u-mt-md'>
      <Select
        isOpen={isOpen}
        selected={selectedRef}
        onSelect={handleSelect}
        onOpenChange={handleOpenChange}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {filteredItems.length === 0 && (
            <SelectOption isDisabled>
              {filterValue ? 'No results found' : 'No images available'}
            </SelectOption>
          )}
          {filteredItems.map((item) => (
            <SelectOption
              key={item.reference}
              value={item.reference}
              className='on-prem-image-item'
              description={
                <Label color='blue' isCompact>
                  {isImageType(item.type)
                    ? simpleTargetNames[item.type]
                    : item.type}
                </Label>
              }
            >
              {getLabel(item)}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </div>
  );
};

export default ImageSelect;
