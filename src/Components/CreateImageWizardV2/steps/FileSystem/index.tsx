import React from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';

import FileSystemAutomaticPartition from './FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './FileSystemConfiguration';
import FileSystemPartition from './FileSystemPartition';

import { useAppSelector } from '../../../../store/hooks';
import { selectFileSystemPartitionMode } from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';
export type FileSystemPartitionMode = 'automatic' | 'manual';

const FileSystemStep = () => {
  const fileSystemPartitionMode = useAppSelector(selectFileSystemPartitionMode);
  const hasIsoTargetOnly = useHasSpecificTargetOnly('image-installer');

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        File system configuration
      </Title>
      <Text>Define the partitioning of the image</Text>
      {hasIsoTargetOnly ? (
        <FileSystemAutomaticPartition />
      ) : fileSystemPartitionMode === 'automatic' ? (
        <>
          <FileSystemPartition />
          <FileSystemAutomaticPartition />
        </>
      ) : fileSystemPartitionMode === 'manual' ? (
        <>
          <FileSystemPartition />
          <FileSystemConfiguration />
        </>
      ) : (
        fileSystemPartitionMode === 'oscap' && <FileSystemConfiguration />
      )}
    </Form>
  );
};

export default FileSystemStep;
