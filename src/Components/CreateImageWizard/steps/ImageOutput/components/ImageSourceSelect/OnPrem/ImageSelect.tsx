import React, { useState } from 'react';

import {
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { simpleTargetNames } from '@/constants';
import type { BootcDistributionItem } from '@/store/api/backend';
import { isImageType } from '@/store/slices/wizard';

type ImageSelectProps = {
  items: BootcDistributionItem[];
  selectedRef: string | undefined;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  getLabel: (item: BootcDistributionItem) => string;
  placeholder?: string;
  isDisabled?: boolean;
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
  isDisabled = false,
  ariaDescribedBy,
}: ImageSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find((item) => item.reference === selectedRef);

  const handleSelect = (
    event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    onSelect(event, selection);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
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

  return (
    <div className='pf-v6-u-mt-md'>
      <Select
        isOpen={isOpen}
        selected={selectedRef}
        onSelect={handleSelect}
        onOpenChange={(open) => setIsOpen(open)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {items.length === 0 && (
            <SelectOption isDisabled>No images available</SelectOption>
          )}
          {items.map((item) => (
            <SelectOption
              key={item.reference}
              value={item.reference}
              description={item.reference}
            >
              {getLabel(item)}{' '}
              <Label color='blue' isCompact>
                {isImageType(item.type)
                  ? simpleTargetNames[item.type]
                  : item.type}
              </Label>
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </div>
  );
};

export default ImageSelect;
