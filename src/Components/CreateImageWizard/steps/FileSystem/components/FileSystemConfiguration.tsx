import React from 'react';

import { Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import {
  addPartition,
  selectBlueprintMode,
  selectDiskPartitions,
  selectFilesystemPartitions,
} from '@/store/slices/wizard';

import FileSystemTable from './FileSystemTable';
import PartitioningMode from './PartitioningMode';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { getNextAvailableMountpoint } from '../fscUtilities';

const FileSystemConfiguration = () => {
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const inImageMode = blueprintMode === 'image';

  const dispatch = useAppDispatch();

  const handleAddPartition = () => {
    const id = uuidv4();
    const mountpoint = getNextAvailableMountpoint(
      filesystemPartitions,
      diskPartitions,
      inImageMode,
    );
    dispatch(
      addPartition({
        id,
        mountpoint,
        min_size: '1',
        unit: 'GiB',
      }),
    );
  };

  return (
    <>
      <PartitioningMode />
      <FileSystemTable partitions={filesystemPartitions} mode='filesystem' />
      <Content>
        <Button
          className='pf-v6-u-text-align-left'
          variant='link'
          icon={<AddCircleOIcon />}
          onClick={handleAddPartition}
        >
          Add partition
        </Button>
      </Content>
    </>
  );
};

export default FileSystemConfiguration;
