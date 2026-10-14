import React, { useEffect, useState } from 'react';

import {
  Button,
  Content,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addDiskPartition,
  addLogicalVolumeToVolumeGroup,
  changeDiskPartitionName,
  getNextAvailableMountpoint,
  removeDiskPartition,
  selectDiskPartitions,
  selectFilesystemPartitions,
  selectIsImageMode,
  validatePartitionName,
  type VolumeGroup,
} from '@/store/slices/wizard';

import FileSystemTable from './FileSystemTable';
import MinimumSize from './MinimumSize';
import SizeUnit from './SizeUnit';

type VolumeGroupsProps = {
  volumeGroup: VolumeGroup | undefined;
};

const VolumeGroups = ({ volumeGroup: vg }: VolumeGroupsProps) => {
  const dispatch = useAppDispatch();
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const inImageMode = useAppSelector(selectIsImageMode);
  const [partitionName, setPartitionName] = useState(vg?.name ?? '');

  useEffect(() => {
    // Reset the partition name when the vg changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPartitionName(vg?.name ?? '');
  }, [vg?.name]);

  // Only one volume group is supported
  const [isExpanded, setIsExpanded] = useState(!!vg);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);

    if (isExpanded && !vg) {
      const vgId = crypto.randomUUID();
      const lvId = crypto.randomUUID();
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
              type: 'lv',
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
    const id = crypto.randomUUID();
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
          type: 'lv',
          mountpoint,
          min_size: '1',
          unit: 'GiB',
          fs_type: 'xfs',
        },
      }),
    );
  };

  if (!vg) {
    return (
      <ExpandableSection
        toggleText='Volume Group Manager'
        onToggle={onToggle}
        isExpanded={isExpanded}
        displaySize='lg'
        className='pf-v6-u-mt-lg'
      />
    );
  }

  return (
    <ExpandableSection
      toggleText='Volume Group Manager'
      onToggle={onToggle}
      isExpanded={isExpanded}
      displaySize='lg'
      className='pf-v6-u-mt-lg'
    >
      <Flex gap={{ default: 'gapXl' }} className='pf-v6-u-pb-md'>
        <FlexItem>
          <FormGroup label='Volume group name'>
            <ValidatedTextInput
              id={`name-${vg.id}`}
              ariaLabel='Volume group name input'
              value={partitionName}
              onChange={(_, name) => setPartitionName(name)}
              placeholder='Add volume group name'
              validator={(value) => validatePartitionName(value)}
              onCommit={(candidate) => {
                dispatch(
                  changeDiskPartitionName({
                    id: vg.id,
                    name: candidate,
                  }),
                );
              }}
            />
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <FormGroup label='Minimum volume group size'>
            <Flex>
              <FlexItem spacer={{ default: 'spacerXs' }}>
                <MinimumSize partition={vg} />
              </FlexItem>
              <FlexItem>
                <SizeUnit partition={vg} />
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
    </ExpandableSection>
  );
};

export default VolumeGroups;
