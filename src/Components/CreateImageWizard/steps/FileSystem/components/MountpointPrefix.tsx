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
  selectBlueprintMode,
} from '../../../../../store/wizardSlice';
import { FilesystemPartition, PartitioningCustomization } from '../fscTypes';
import {
  getPrefix,
  getSubpath,
  isMountpointPrefixAvailable,
} from '../fscUtilities';

export const mountpointPrefixes = [
  '/',
  '/app',
  '/boot',
  '/data',
  '/home',
  '/opt',
  '/srv',
  '/tmp',
  '/usr',
  '/var',
];

type MountpointPrefixPropTypes = {
  partition: FilesystemPartition;
  customization: PartitioningCustomization;
};

const MountpointPrefix = ({
  partition,
  customization,
}: MountpointPrefixPropTypes) => {
  const dispatch = useAppDispatch();
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const [isOpen, setIsOpen] = useState(false);
  const prefix = getPrefix(partition.mountpoint);
  const subpath = getSubpath(partition.mountpoint);

  const onSelect = (event?: React.MouseEvent, selection?: string | number) => {
    if (selection && typeof selection === 'string') {
      setIsOpen(false);
      const mountpoint = selection + (subpath.length > 0 ? '/' + subpath : '');
      dispatch(
        changePartitionMountpoint({
          id: partition.id,
          mountpoint: mountpoint,
          customization: customization,
        }),
      );
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      // disable root partition prefix for filesystem customization
      // ensuring it will stay present
      isDisabled={customization === 'fileSystem' && prefix === '/'}
      isFullWidth
    >
      {prefix}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={prefix}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {mountpointPrefixes
          .filter((prefix) =>
            isMountpointPrefixAvailable(
              prefix,
              partition,
              customization,
              blueprintMode,
            ),
          )
          .map((prefix, index) => {
            return (
              <SelectOption key={index} value={prefix}>
                {prefix}
              </SelectOption>
            );
          })}
      </SelectList>
    </Select>
  );
};

export default MountpointPrefix;
