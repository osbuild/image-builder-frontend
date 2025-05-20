import React from 'react';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { v4 as uuidv4 } from 'uuid';

import FileSystemTable from './FileSystemTable';

import { FILE_SYSTEM_CUSTOMIZATION_URL } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  addPartition,
  selectImageTypes,
  selectPartitions,
} from '../../../../store/wizardSlice';
import UsrSubDirectoriesDisabled from '../../UsrSubDirectoriesDisabled';

const FileSystemConfiguration = () => {
  const partitions = useAppSelector(selectPartitions);
  const environments = useAppSelector(selectImageTypes);

  const dispatch = useAppDispatch();

  const handleAddPartition = () => {
    const id = uuidv4();
    dispatch(
      addPartition({
        id,
        mountpoint: '/home',
        min_size: '1',
        unit: 'GiB',
      })
    );
  };

  return (
    <>
      <Content>
        <Content component={ContentVariants.h3}>Configure partitions</Content>
      </Content>
      {partitions?.find((partition) =>
        partition?.mountpoint?.includes('/usr')
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
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            href={FILE_SYSTEM_CUSTOMIZATION_URL}
            className="pf-v6-u-pl-0"
          >
            Read more about manual configuration here
          </Button>
        </Content>
      </Content>
      {environments.includes('image-installer') && (
        <Alert
          variant="warning"
          isInline
          title="Filesystem customizations are not applied to 'Bare metal - Installer' images"
        />
      )}
      <FileSystemTable />
      <Content>
        <Button
          className="pf-v6-u-text-align-left"
          variant="link"
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
