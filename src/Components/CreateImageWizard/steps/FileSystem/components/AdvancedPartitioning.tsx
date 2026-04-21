import React, { useState } from 'react';

import {
  Button,
  Content,
  Flex,
  FlexItem,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import {
  addDiskPartition,
  changeDiskMinsize,
  changeDiskUnit,
  selectDiskMinsize,
  selectDiskPartitions,
  selectDiskUnit,
  selectFilesystemPartitions,
  selectIsImageMode,
} from '@/store/slices/wizard';

import FileSystemTable from './FileSystemTable';
import VolumeGroups from './VolumeGroups';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { Units } from '../fscTypes';
import { getNextAvailableMountpoint } from '../fscUtilities';

const units = ['GiB', 'MiB'];

const AdvancedPartitioning = () => {
  const dispatch = useAppDispatch();
  const minsize = useAppSelector(selectDiskMinsize);
  const unit = useAppSelector(selectDiskUnit);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const inImageMode = useAppSelector(selectIsImageMode);
  const [isOpen, setIsOpen] = useState(false);
  const handleAddPartition = () => {
    const id = uuidv4();
    const mountpoint = getNextAvailableMountpoint(
      filesystemPartitions,
      diskPartitions,
      inImageMode,
    );
    dispatch(
      addDiskPartition({
        id,
        fs_type: 'xfs',
        min_size: '1',
        unit: 'GiB',
        type: 'plain',
        mountpoint,
      }),
    );
  };

  const handleAddVolumeGroup = () => {
    const vgId = uuidv4();
    const lvId = uuidv4();
    const mountpoint = getNextAvailableMountpoint(
      filesystemPartitions,
      diskPartitions,
      inImageMode,
    );
    dispatch(
      addDiskPartition({
        id: vgId,
        name: '',
        min_size: '1',
        unit: 'GiB',
        type: 'lvm',
        logical_volumes: [
          {
            id: lvId,
            name: '',
            mountpoint,
            min_size: '1',
            unit: 'GiB',
            fs_type: 'xfs',
          },
        ],
      }),
    );
  };

  const handleDiskMinsizeChange = (_e: React.FormEvent, value: string) => {
    dispatch(changeDiskMinsize(value));
  };

  const onUnitSelect = (
    _event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    if (selection === undefined) return;
    dispatch(changeDiskUnit(selection as Units));
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      {unit}
    </MenuToggle>
  );

  return (
    <>
      <FormGroup label='Minimum disk size'>
        <Flex gap={{ default: 'gapSm' }}>
          <FlexItem style={{ width: '30%' }}>
            <TextInput
              aria-label='Minimum disk size input'
              value={minsize}
              type='text'
              onChange={handleDiskMinsizeChange}
              placeholder='Define minimum size'
            />
          </FlexItem>
          <FlexItem>
            <Select
              isOpen={isOpen}
              selected={unit}
              onSelect={onUnitSelect}
              onOpenChange={(isOpen) => setIsOpen(isOpen)}
              toggle={toggle}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                {units.map((unitOption, index) => (
                  <SelectOption key={index} value={unitOption}>
                    {unitOption}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>
        </Flex>
      </FormGroup>
      {diskPartitions.filter((p) => p.type === 'plain').length > 0 && (
        <FileSystemTable
          partitions={diskPartitions.filter((p) => p.type === 'plain')}
          mode='disk-plain'
        />
      )}
      <Content>
        <Button
          className='pf-v6-u-text-align-left'
          variant='link'
          icon={<AddCircleOIcon />}
          onClick={handleAddPartition}
        >
          Add plain partition
        </Button>
      </Content>
      <VolumeGroups
        volumeGroups={diskPartitions.filter((p) => p.type === 'lvm')}
      />
      {!diskPartitions.find((p) => p.type === 'lvm') && (
        <Content>
          <Button
            className='pf-v6-u-text-align-left'
            variant='link'
            icon={<AddCircleOIcon />}
            onClick={handleAddVolumeGroup}
          >
            Add LVM volume group
          </Button>
        </Content>
      )}
    </>
  );
};

export default AdvancedPartitioning;
