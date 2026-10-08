import React, { useState } from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { useAppDispatch } from '@/store/hooks';
import {
  changePartitionMinSize,
  changePartitionUnit,
  DiskPartition,
  FilesystemPartition,
  type Units,
} from '@/store/slices/wizard';

const units = ['GiB', 'MiB'];

type SizeUnitProps = {
  partition: FilesystemPartition | DiskPartition;
  isOscapRequired?: boolean;
};

const SizeUnit = ({ partition, isOscapRequired }: SizeUnitProps) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const [initialValue] = useState(partition);

  const onSelect = (_?: React.MouseEvent, selection?: string | number) => {
    if (selection === undefined) return;
    if (initialValue.unit === 'B' && selection === ('B' as Units)) {
      dispatch(
        changePartitionMinSize({
          id: partition.id,
          min_size: initialValue.min_size || '0',
        }),
      );
    }
    dispatch(
      changePartitionUnit({
        id: partition.id,
        unit: selection as Units,
      }),
    );
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
      isDisabled={!!isOscapRequired}
    >
      {partition.unit}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={partition.unit}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {units.map((unit, index) => (
          <SelectOption key={index} value={unit}>
            {unit}
          </SelectOption>
        ))}
        <>
          {initialValue.unit === 'B' && (
            <SelectOption value={'B'}>B</SelectOption>
          )}
        </>
      </SelectList>
    </Select>
  );
};

export default SizeUnit;
