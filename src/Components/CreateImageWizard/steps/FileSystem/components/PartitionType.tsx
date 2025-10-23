import React, { useState } from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { useAppDispatch } from '../../../../../store/hooks';
import { changePartitionType } from '../../../../../store/wizardSlice';
import { FSType, LogicalVolumeWithBase } from '../fscTypes';

const fs_types = ['ext4', 'xfs', 'vfat', 'swap'];

type PartitionTypePropTypes = {
  partition: LogicalVolumeWithBase;
  customization: 'disk' | 'fileSystem';
};

const PartitionType = ({
  partition,
  customization,
}: PartitionTypePropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (event?: React.MouseEvent, selection?: string | number) => {
    if (selection === undefined) return;
    dispatch(
      changePartitionType({
        id: partition.id,
        fs_type: selection as FSType,
        customization: customization,
      }),
    );
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      {partition.fs_type}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={partition.fs_type}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {fs_types.map((type, index) => (
          <SelectOption key={index} value={type}>
            {type}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default PartitionType;
