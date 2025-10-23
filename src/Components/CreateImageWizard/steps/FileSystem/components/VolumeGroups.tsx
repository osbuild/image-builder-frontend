import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import FileSystemTable from './FileSystemTable';
import MinimumSize from './MinimumSize';
import SizeUnit from './SizeUnit';

import { useAppDispatch } from '../../../../../store/hooks';
import { VolumeGroup } from '../../../../../store/imageBuilderApi';
import {
  addLogicalVolumeToVolumeGroup,
  changeDiskPartitionName,
  removeDiskPartition,
} from '../../../../../store/wizardSlice';
import { FscDiskPartition, FscDiskPartitionBase } from '../fscTypes';

type VolumeGroupsType = {
  volumeGroups: Extract<FscDiskPartition, VolumeGroup & FscDiskPartitionBase>[];
};

const VolumeGroups = ({ volumeGroups }: VolumeGroupsType) => {
  const dispatch = useAppDispatch();

  const handleAddLogicalVolume = (vgId: string) => {
    const id = uuidv4();
    dispatch(
      addLogicalVolumeToVolumeGroup({
        vgId: vgId,
        logicalVolume: {
          id,
          name: '',
          mountpoint: '/home',
          min_size: '1',
          unit: 'GiB',
          fs_type: 'ext4',
        },
      }),
    );
  };

  return volumeGroups.map((vg) => (
    <Card key={vg.id}>
      <CardHeader
        actions={{
          actions: (
            <Button
              variant='plain'
              aria-label='Remove volume group button'
              icon={<TimesIcon />}
              onClick={() => dispatch(removeDiskPartition(vg.id))}
            />
          ),
        }}
      />
      <CardBody>
        <FormGroup label='Volume group name'>
          <TextInput
            aria-label='Volume group name input'
            value={vg.name || ''}
            type='text'
            onChange={(event, name) =>
              dispatch(changeDiskPartitionName({ id: vg.id, name: name }))
            }
            placeholder='Add volume group name'
            className='pf-v6-u-w-25'
          />
        </FormGroup>
        <FormGroup label='Minimum volume group size'>
          <Flex>
            <FlexItem spacer={{ default: 'spacerNone' }}>
              <MinimumSize partition={vg} customization='disk' />
            </FlexItem>
            <FlexItem>
              <SizeUnit partition={vg} customization='disk' />
            </FlexItem>
          </Flex>
        </FormGroup>
        {vg.logical_volumes.length > 0 && (
          <FileSystemTable partitions={vg.logical_volumes} mode='disk-lvm' />
        )}
        <Content>
          <Button
            className='pf-v6-u-text-align-left'
            variant='link'
            icon={<PlusCircleIcon />}
            onClick={() => handleAddLogicalVolume(vg.id)}
          >
            Add logical volume
          </Button>
        </Content>
      </CardBody>
    </Card>
  ));
};

export default VolumeGroups;
