import React from 'react';

import {
  Alert,
  Button,
  Text,
  TextContent,
  TextVariants,
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
      <TextContent>
        <Text component={TextVariants.h3}>Configure partitions</Text>
      </TextContent>
      {partitions?.find((partition) =>
        partition?.mountpoint?.includes('/usr')
      ) && <UsrSubDirectoriesDisabled />}
      <TextContent>
        <Text>
          Create partitions for your image by defining mount points and minimum
          sizes. Image builder creates partitions with a logical volume (LVM)
          device type.
        </Text>
        <Text>
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
            className="pf-u-pl-0"
          >
            Read more about manual configuration here
          </Button>
        </Text>
      </TextContent>
      {environments.includes('image-installer') && (
        <Alert
          variant="warning"
          isInline
          title="Filesystem customizations are not applied to 'Bare metal - Installer' images"
        />
      )}
      <FileSystemTable />
      <TextContent>
        <Button
          ouiaId="add-partition"
          data-testid="file-system-add-partition"
          className="pf-u-text-align-left"
          variant="link"
          icon={<PlusCircleIcon />}
          onClick={handleAddPartition}
        >
          Add partition
        </Button>
      </TextContent>
    </>
  );
};

export default FileSystemConfiguration;
