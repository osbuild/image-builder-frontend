import React from 'react';

import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import FileSystemTable from './FileSystemTable';
import VolumeGroups from './VolumeGroups';

import { PARTITIONING_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addDiskPartition,
  changeDiskMinsize,
  selectDiskMinsize,
  selectDiskPartitions,
} from '../../../../../store/wizardSlice';

const AdvancedPartitioning = () => {
  const dispatch = useAppDispatch();
  const minsize = useAppSelector(selectDiskMinsize);
  const diskPartitions = useAppSelector(selectDiskPartitions);

  const bootPartitionExists = () => {
    return (
      diskPartitions.some((p) => p.type === 'plain' && p.mountpoint === '/') ||
      diskPartitions.some(
        (p) =>
          p.type === 'lvm' &&
          p.logical_volumes.some((lv) => lv.mountpoint === '/'),
      )
    );
  };

  const handleAddPartition = () => {
    const id = uuidv4();
    dispatch(
      addDiskPartition({
        id,
        fs_type: 'ext4',
        min_size: '1',
        unit: 'GiB',
        type: 'plain',
        mountpoint: bootPartitionExists() ? '/home' : '/',
      }),
    );
  };

  const handleAddVolumeGroup = () => {
    const vgId = uuidv4();
    const lvId = uuidv4();
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
            mountpoint: '/home',
            min_size: '1',
            unit: 'GiB',
            fs_type: 'ext4',
          },
        ],
      }),
    );
  };

  const handleDiskMinsizeChange = (e: React.FormEvent, value: string) => {
    dispatch(changeDiskMinsize(value));
  };

  return (
    <>
      <Content>
        <Content component={ContentVariants.h3}>Configure disk layout</Content>
      </Content>
      <Content>
        <Content>Define complete partition table for your image.</Content>
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
            href={PARTITIONING_URL}
            className='pf-v6-u-pl-0'
          >
            Read more about advanced partitioning here
          </Button>
        </Content>
      </Content>
      <FormGroup label='Minimum disk size'>
        <TextInput
          aria-label='Minimum disk size input'
          value={minsize}
          type='text'
          onChange={handleDiskMinsizeChange}
          placeholder='Define minimum disk size'
          className='pf-v6-u-w-25'
        />
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
          icon={<PlusCircleIcon />}
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
            icon={<PlusCircleIcon />}
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
