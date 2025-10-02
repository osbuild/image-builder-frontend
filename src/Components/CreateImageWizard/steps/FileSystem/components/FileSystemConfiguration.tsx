import React from 'react';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import FileSystemTable from './FileSystemTable';

import {
  FILE_SYSTEM_CUSTOMIZATION_URL,
  targetOptions,
} from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { ImageTypes } from '../../../../../store/imageBuilderApi';
import {
  addPartition,
  selectFilesystemPartitions,
  selectImageTypes,
} from '../../../../../store/wizardSlice';
import UsrSubDirectoriesDisabled from '../../../UsrSubDirectoriesDisabled';

const FileSystemConfiguration = () => {
  const environments = useAppSelector(selectImageTypes);
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);

  const dispatch = useAppDispatch();

  const handleAddPartition = () => {
    const id = uuidv4();
    dispatch(
      addPartition({
        id,
        mountpoint: '/home',
        min_size: '1',
        unit: 'GiB',
      }),
    );
  };

  const automaticPartitioningOnlyTargets: ImageTypes[] = [
    'image-installer',
    'wsl',
  ];

  const filteredTargets = (
    automaticPartitioningOnlyTargets.filter((env) =>
      environments.includes(env),
    ) as ImageTypes[]
  ).map((env) => targetOptions[env]);

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
      {(environments.includes('image-installer') ||
        environments.includes('wsl')) && (
        <Alert
          variant='warning'
          isInline
          title={`Filesystem customizations are not applied to ${filteredTargets.join(
            ' and ',
          )} images`}
        />
      )}
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
