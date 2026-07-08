import React from 'react';

import { Flex } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectDiskMinsize,
  selectDiskUnit,
  selectFilesystemPartitions,
  selectFscMode,
  selectImageMinSize,
  selectPlainPartitions,
  selectVolumeGroups,
} from '@/store/slices';

import { FlexColumn, ReviewGroup, ReviewSection } from '../../shared';
import { Hideable } from '../../types';

export const Filesystem = ({ shouldHide }: Hideable) => {
  const mode = useAppSelector(selectFscMode);
  const minSize = useAppSelector(selectImageMinSize);
  const diskMinsize = useAppSelector(selectDiskMinsize);
  const diskUnit = useAppSelector(selectDiskUnit);
  const plainPartitions = useAppSelector(selectPlainPartitions);
  const volumeGroups = useAppSelector(selectVolumeGroups);
  const basicPartitions = useAppSelector(selectFilesystemPartitions);

  if (shouldHide) {
    return null;
  }

  const partitioningLabel =
    mode === 'automatic'
      ? 'Automatic partitioning'
      : mode === 'advanced'
        ? 'Advanced disk partitioning'
        : 'Manual partitioning';

  return (
    <ReviewSection title='File system configurations'>
      <ReviewGroup
        heading='Partitioning type'
        description={partitioningLabel}
      />
      {mode === 'basic' && minSize !== undefined && (
        <ReviewGroup
          heading='Image size (minimum)'
          description={minSize < 1 ? 'Less than 1GiB' : `${minSize} GiB`}
        />
      )}
      {mode === 'basic' && basicPartitions.length > 0 && (
        <ReviewGroup
          heading='Partitions'
          description={
            <Flex>
              <FlexColumn
                heading='Mount point'
                labelKey='basic-partition-mount'
                items={basicPartitions.map((p) => p.mountpoint)}
              />
              <FlexColumn
                heading='Minimum'
                labelKey='basic-partition-size'
                items={basicPartitions.map((p) => p.min_size)}
              />
              <FlexColumn
                heading='Unit'
                labelKey='basic-partition-unit'
                items={basicPartitions.map((p) => p.unit)}
              />
            </Flex>
          }
        />
      )}
      {mode === 'advanced' && diskMinsize && (
        <ReviewGroup
          heading='Minimum disk size'
          description={`${diskMinsize} ${diskUnit}`}
        />
      )}
      {mode === 'advanced' && plainPartitions.length > 0 && (
        <ReviewGroup
          heading='Partitions'
          description={
            <Flex>
              <FlexColumn
                heading='Mount point'
                labelKey='adv-partition-mount'
                items={plainPartitions.map((p) =>
                  'mountpoint' in p ? (p.mountpoint ?? '--') : '--',
                )}
              />
              <FlexColumn
                heading='Type'
                labelKey='adv-partition-type'
                items={plainPartitions.map((p) =>
                  'fs_type' in p ? p.fs_type : '--',
                )}
              />
              <FlexColumn
                heading='Minimum'
                labelKey='adv-partition-size'
                items={plainPartitions.map((p) => p.min_size ?? '--')}
              />
              <FlexColumn
                heading='Unit'
                labelKey='adv-partition-unit'
                items={plainPartitions.map((p) => p.unit ?? '--')}
              />
            </Flex>
          }
        />
      )}
      {mode === 'advanced' &&
        volumeGroups.map((vg, vgIndex) => (
          <React.Fragment key={`vg-${vgIndex}`}>
            {vg.name && (
              <ReviewGroup
                heading='Volume group manager'
                description={vg.name}
              />
            )}
            {(vg.min_size || vg.minsize) && (
              <ReviewGroup
                heading='Minimum group size'
                description={`${vg.min_size || vg.minsize} ${vg.unit ?? 'GiB'}`}
              />
            )}
            {vg.logical_volumes.length > 0 && (
              <ReviewGroup
                heading='Logical volumes'
                description={
                  <Flex>
                    <FlexColumn
                      heading='Name'
                      labelKey={`lv-name-${vgIndex}`}
                      items={vg.logical_volumes.map((lv) => lv.name ?? '--')}
                    />
                    <FlexColumn
                      heading='Mount point'
                      labelKey={`lv-mount-${vgIndex}`}
                      items={vg.logical_volumes.map(
                        (lv) => lv.mountpoint ?? '--',
                      )}
                    />
                    <FlexColumn
                      heading='Type'
                      labelKey={`lv-type-${vgIndex}`}
                      items={vg.logical_volumes.map((lv) => lv.fs_type)}
                    />
                    <FlexColumn
                      heading='Minimum'
                      labelKey={`lv-size-${vgIndex}`}
                      items={vg.logical_volumes.map(
                        (lv) => lv.min_size ?? '--',
                      )}
                    />
                    <FlexColumn
                      heading='Unit'
                      labelKey={`lv-unit-${vgIndex}`}
                      items={vg.logical_volumes.map((lv) => lv.unit ?? 'GiB')}
                    />
                  </Flex>
                }
              />
            )}
          </React.Fragment>
        ))}
    </ReviewSection>
  );
};
