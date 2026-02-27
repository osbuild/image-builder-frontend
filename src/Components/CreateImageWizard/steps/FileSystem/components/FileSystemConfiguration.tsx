import React from 'react';

import {
  Button,
  Checkbox,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import FileSystemTable from './FileSystemTable';
import PartitioningMode from './PartitioningMode';

import { FILE_SYSTEM_CUSTOMIZATION_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addPartition,
  changePartitioningMode,
  selectBlueprintMode,
  selectDiskPartitions,
  selectFilesystemPartitions,
  selectPartitioningMode,
} from '../../../../../store/wizardSlice';
import UsrSubDirectoriesDisabled from '../../../UsrSubDirectoriesDisabled';
import { getNextAvailableMountpoint } from '../fscUtilities';

const FileSystemConfiguration = () => {
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const partitioningMode = useAppSelector(selectPartitioningMode);
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
      <Content>
        <Content component={ContentVariants.h3}>Configure partitions</Content>
      </Content>
      {filesystemPartitions.find((partition) =>
        partition.mountpoint.includes('/usr'),
      ) && <UsrSubDirectoriesDisabled />}
      <Content>
        <Content>
          Create partitions for your image by defining mount points and minimum
          sizes. Image builder creates partitions with a logical volume (LVM)
          device type.
        </Content>
        <Content>
          The order of partitions may change when the image is installed in
          order to conform to best practices and ensure functionality.
          <br></br>
          <Button
            component='a'
            target='_blank'
            variant='link'
            icon={<ExternalLinkAltIcon />}
            iconPosition='right'
            href={FILE_SYSTEM_CUSTOMIZATION_URL}
            className='pf-v6-u-pl-0'
          >
            Read more about manual configuration here
          </Button>
        </Content>
      </Content>
      <Checkbox
        label='Select partitioning mode'
        isChecked={partitioningMode !== undefined}
        onChange={(_event, checked) => {
          if (checked) {
            dispatch(changePartitioningMode('auto-lvm'));
          } else {
            dispatch(changePartitioningMode(undefined));
          }
        }}
        aria-label='Select partitioning mode checkbox'
        id='select-partitioning-mode-switch'
        name='select-partitioning-mode-switch'
        body={partitioningMode !== undefined && <PartitioningMode />}
      />
      <FileSystemTable partitions={filesystemPartitions} mode='filesystem' />
      <Content>
        <Button
          className='pf-v6-u-text-align-left'
          variant='link'
          icon={<PlusCircleIcon />}
          onClick={handleAddPartition}
        >
          Add partition
        </Button>
      </Content>
    </>
  );
};

export default FileSystemConfiguration;
