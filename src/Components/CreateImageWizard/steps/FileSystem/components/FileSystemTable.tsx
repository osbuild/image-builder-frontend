import React, { useMemo } from 'react';

import { Content, Flex, FlexItem } from '@patternfly/react-core';

import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  DiskPartition,
  FilesystemPartition,
  parseSizeUnit,
  selectComplianceProfileID,
  selectDistribution,
} from '@/store/slices/wizard';

import DiskRow from './DiskRow';
import Row from './Row';

type FileSystemTableTypes =
  | {
      partitions: FilesystemPartition[];
      mode: 'filesystem';
    }
  | {
      partitions: DiskPartition[];
      mode: 'disk-plain' | 'disk-lvm';
    };

const FileSystemTable = ({ partitions, mode }: FileSystemTableTypes) => {
  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-expect-error skipped when undefined
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const getOscapPartitionInfo = (mountpoint: string) => {
    const oscapPartition = oscapProfileInfo?.filesystem?.find(
      (fs) => fs.mountpoint === mountpoint,
    );
    return {
      isOscapRequired: !!oscapPartition,
      oscapMinSizeLabel: oscapPartition
        ? parseSizeUnit(String(oscapPartition.min_size)).join(' ')
        : '',
    };
  };

  const isFilesystemPartition = (
    p: FilesystemPartition | DiskPartition,
  ): p is FilesystemPartition => !('type' in p);

  const rootPartitionsCount = useMemo(
    () =>
      partitions
        .filter(isFilesystemPartition)
        .filter((p) => p.mountpoint === '/').length,
    [partitions],
  );

  return (
    <div aria-label='File system table'>
      <Flex className='pf-v6-u-pb-sm'>
        {mode === 'disk-lvm' && (
          <FlexItem style={{ flex: '0 0 25%' }}>
            <Content component='small'>Name</Content>
          </FlexItem>
        )}
        <FlexItem
          style={{
            flex: mode === 'disk-lvm' ? '0 0 25%' : '0 0 40%',
          }}
        >
          <Content component='small'>Mount point</Content>
        </FlexItem>
        <FlexItem
          style={{
            flex: mode === 'filesystem' ? '0 0 20%' : '0 0 10%',
          }}
        >
          <Content component='small'>Type</Content>
        </FlexItem>
        <FlexItem style={{ flex: '1 1 auto' }}>
          <Content component='small'>Minimum size</Content>
        </FlexItem>
        <FlexItem style={{ flex: '0 0 auto' }}>
          <Content component='small' aria-label='Remove mount point'>
            {' '}
          </Content>
        </FlexItem>
      </Flex>
      {partitions.length > 0 && mode === 'filesystem'
        ? partitions.map((partition) => (
            <Row
              key={partition.id}
              partition={partition as FilesystemPartition}
              isRemovingDisabled={
                rootPartitionsCount === 1 && partition.mountpoint === '/'
              }
              {...getOscapPartitionInfo(partition.mountpoint)}
            />
          ))
        : partitions.map((partition) => (
            <DiskRow
              key={partition.id}
              partition={partition as DiskPartition}
            />
          ))}
    </div>
  );
};

export default FileSystemTable;
