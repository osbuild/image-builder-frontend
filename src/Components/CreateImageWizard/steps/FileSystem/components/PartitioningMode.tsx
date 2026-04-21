import React, { useState } from 'react';

import {
  Divider,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changePartitioningMode,
  selectPartitioningMode,
} from '@/store/slices/wizard';

const partitioningOptions = [
  {
    value: 'auto-lvm',
    label: 'Auto-LVM partitioning',
    description:
      'Converts partitions to LVM only if new mountpoints are defined in the filesystem customization',
  },
  {
    value: 'raw',
    label: 'Raw partitioning',
    description: 'Will not convert any partition to LVM or Btrfs',
  },
  {
    value: 'lvm',
    label: 'LVM partitioning',
    description:
      'Converts the partition that contains the root mountpoint / to an LVM Volume Group and creates a root Logical Volume. Any extra mountpoints, except /boot, will be added to the Volume Group as new Logical Volumes',
  },
];

const PartitioningMode = () => {
  const dispatch = useAppDispatch();
  const partitioningMode = useAppSelector(selectPartitioningMode);
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event?: React.MouseEvent, selection?: string | number) => {
    if (selection === 'default') {
      dispatch(changePartitioningMode(undefined));
    } else if (
      selection === 'auto-lvm' ||
      selection === 'raw' ||
      selection === 'lvm'
    ) {
      dispatch(changePartitioningMode(selection));
    }
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
      style={{ width: '100%' }}
    >
      {partitioningMode === undefined
        ? 'Select partitioning mode'
        : partitioningOptions.find((opt) => opt.value === partitioningMode)
            ?.label}
    </MenuToggle>
  );

  return (
    <FormGroup label='Partitioning mode'>
      <Select
        isOpen={isOpen}
        selected={partitioningMode ?? 'default'}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        style={{ width: '30%' }}
      >
        <SelectList>
          <SelectOption key='default' value='default'>
            Default
          </SelectOption>
          <Divider />
          {partitioningOptions.map((option) => (
            <SelectOption
              key={option.value}
              value={option.value}
              description={option.description}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default PartitioningMode;
