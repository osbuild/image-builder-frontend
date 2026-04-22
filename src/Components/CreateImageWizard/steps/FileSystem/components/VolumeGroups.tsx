import React, { useState } from 'react';

import {
  Button,
  Content,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import { VolumeGroup } from '@/store/api/backend';
import {
  addDiskPartition,
  addLogicalVolumeToVolumeGroup,
  changeDiskPartitionName,
  removeDiskPartition,
  selectDiskPartitions,
  selectFilesystemPartitions,
  selectIsImageMode,
} from '@/store/slices/wizard';

import FileSystemTable from './FileSystemTable';
import MinimumSize from './MinimumSize';
import SizeUnit from './SizeUnit';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { DiskPartition, DiskPartitionBase } from '../fscTypes';
import { getNextAvailableMountpoint } from '../fscUtilities';

type VolumeGroupType =
  | Extract<DiskPartition, VolumeGroup & DiskPartitionBase>
  | undefined;

type VolumeGroupsType = {
  volumeGroups: VolumeGroupType[];
};

const VolumeGroups = ({ volumeGroups }: VolumeGroupsType) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const inImageMode = useAppSelector(selectIsImageMode);

  // Only one volume group is supported
  const vg = volumeGroups[0];
  const [isExpanded, setIsExpanded] = useState(!!vg);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);

    if (isExpanded && !vg) {
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
    } else if (!isExpanded && vg) {
      dispatch(removeDiskPartition(vg.id));
    }
  };

  const handleAddLogicalVolume = (vgId: string) => {
    const id = uuidv4();
    const mountpoint = getNextAvailableMountpoint(
      filesystemPartitions,
      diskPartitions,
      inImageMode,
    );
    dispatch(
      addLogicalVolumeToVolumeGroup({
        vgId: vgId,
        logicalVolume: {
          id,
          name: '',
          mountpoint,
          min_size: '1',
          unit: 'GiB',
          fs_type: 'xfs',
        },
      }),
    );
  };

  return (
    <ExpandableSection
      toggleText='Volume Group Manager'
      onToggle={onToggle}
      isExpanded={isExpanded}
      displaySize='lg'
      isWidthLimited
    >
      {vg ? (
        <>
          <Flex gap={{ default: 'gapXl' }}>
            <FlexItem>
              <FormGroup label='Volume group name'>
                <ValidatedInputAndTextArea
                  ariaLabel='Volume group name input'
                  value={vg.name || ''}
                  onChange={(_event, name) =>
                    dispatch(changeDiskPartitionName({ id: vg.id, name: name }))
                  }
                  placeholder='Add volume group name'
                  stepValidation={stepValidation}
                  fieldName={`name-${vg.id}`}
                />
              </FormGroup>
            </FlexItem>
            <FlexItem>
              <FormGroup label='Minimum volume group size'>
                <Flex>
                  <FlexItem spacer={{ default: 'spacerXs' }}>
                    <MinimumSize partition={vg} customization='disk' />
                  </FlexItem>
                  <FlexItem>
                    <SizeUnit partition={vg} customization='disk' />
                  </FlexItem>
                </Flex>
              </FormGroup>
            </FlexItem>
          </Flex>
          {vg.logical_volumes.length > 0 && (
            <FileSystemTable partitions={vg.logical_volumes} mode='disk-lvm' />
          )}
          <Content>
            <Button
              className='pf-v6-u-text-align-left'
              variant='link'
              icon={<AddCircleOIcon />}
              onClick={() => handleAddLogicalVolume(vg.id)}
            >
              Add logical volume
            </Button>
          </Content>
        </>
      ) : null}
    </ExpandableSection>
  );
};

export default VolumeGroups;
