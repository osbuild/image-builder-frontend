import React, { useEffect, useState } from 'react';

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
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addDiskPartition,
  changeDiskMinsize,
  changeDiskUnit,
  getNextAvailableMountpoint,
  selectDiskMinsize,
  selectDiskPartitions,
  selectDiskUnit,
  selectFilesystemPartitions,
  selectIsImageMode,
  Units,
  validateOptionalMinsize,
} from '@/store/slices/wizard';

import FileSystemTable from './FileSystemTable';
import VolumeGroups from './VolumeGroups';

const units = ['GiB', 'MiB'];

const AdvancedPartitioning = () => {
  const dispatch = useAppDispatch();
  const minsize = useAppSelector(selectDiskMinsize);
  const unit = useAppSelector(selectDiskUnit);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const inImageMode = useAppSelector(selectIsImageMode);
  const [isOpen, setIsOpen] = useState(false);
  const [diskSize, setDiskSize] = useState(minsize ?? '');

  useEffect(() => {
    setDiskSize(minsize ?? '');
  }, [minsize]);

  const handleAddPartition = () => {
    const id = crypto.randomUUID();
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
          <FlexItem style={{ width: '50%' }}>
            <ValidatedTextInput
              id='disk-min-size'
              ariaLabel='Minimum disk size input'
              value={diskSize}
              placeholder='Define minimum size'
              validator={(value) => validateOptionalMinsize(value)}
              onChange={(_, value) => setDiskSize(value)}
              onCommit={(candidate) => {
                if (candidate === undefined) return;

                dispatch(changeDiskMinsize(candidate));
              }}
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
        volumeGroup={diskPartitions.find(
          (partition) => partition.type === 'lvm',
        )}
      />
    </>
  );
};

export default AdvancedPartitioning;
