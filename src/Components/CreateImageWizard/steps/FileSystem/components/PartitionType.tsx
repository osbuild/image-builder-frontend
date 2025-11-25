import React, { useState } from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  changePartitionMountpoint,
  changePartitionType,
} from '../../../../../store/wizardSlice';
import {
  FSType,
  LogicalVolumeWithBase,
  PartitioningCustomization,
} from '../fscTypes';

const fs_types = ['ext4', 'xfs', 'vfat', 'swap'];

type PartitionTypePropTypes = {
  partition: LogicalVolumeWithBase;
  customization: PartitioningCustomization;
};

const PartitionType = ({
  partition,
  customization,
}: PartitionTypePropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (event?: React.MouseEvent, selection?: string | number) => {
    if (selection === undefined) return;

    if (selection === 'swap') {
      dispatch(
        changePartitionMountpoint({
          id: partition.id,
          mountpoint: '',
          customization: customization,
        }),
      );
    }

    if (partition.mountpoint === '' && selection !== 'swap') {
      dispatch(
        changePartitionMountpoint({
          id: partition.id,
          mountpoint: '/home',
          customization: customization,
        }),
      );
    }

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
        {fs_types
          .filter((type) => {
            if ('type' in partition && partition.type === 'plain') {
              if (type === 'swap') {
                return false;
              }
              if (partition.mountpoint === '/boot' && type === 'vfat') {
                return false;
              }
              if (
                partition.mountpoint === '/boot/efi' &&
                (type === 'ext4' || type === 'xfs')
              ) {
                return false;
              }
              return true;
            }
            return true;
          })
          .map((type, index) => (
            <SelectOption key={index} value={type}>
              {type}
            </SelectOption>
          ))}
      </SelectList>
    </Select>
  );
};

export default PartitionType;
