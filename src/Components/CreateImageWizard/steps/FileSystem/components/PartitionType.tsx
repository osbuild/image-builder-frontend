import React, { useState } from 'react';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changePartitionMountpoint,
  changePartitionType,
  selectDiskPartitions,
  selectFilesystemPartitions,
  selectIsImageMode,
} from '../../../../../store/wizardSlice';
import {
  FSType,
  LogicalVolumeWithBase,
  PartitioningCustomization,
} from '../fscTypes';
import {
  getNextAvailableMountpoint,
  isPartitionTypeAvailable,
} from '../fscUtilities';

const fs_types: FSType[] = ['ext4', 'xfs', 'vfat', 'swap'];

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
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const isImageMode = useAppSelector(selectIsImageMode);
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
      const mountpoint = getNextAvailableMountpoint(
        filesystemPartitions,
        diskPartitions,
        isImageMode,
      );
      dispatch(
        changePartitionMountpoint({
          id: partition.id,
          mountpoint,
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
          .filter((type) => isPartitionTypeAvailable(type, partition))
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
