import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import FileSystemAutomaticPartition from './FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './FileSystemConfiguration';
import FileSystemPartition from './FileSystemPartition';

import { useAppSelector } from '../../../../store/hooks';
import { selectFileSystemPartitionMode } from '../../../../store/wizardSlice';
export type FileSystemPartitionMode = 'automatic' | 'manual';

const FileSystemStep = () => {
  const fileSystemPartitionMode = useAppSelector(selectFileSystemPartitionMode);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        File system configuration
      </Title>
      <Text>Define the partitioning of the image</Text>
      {fileSystemPartitionMode === 'automatic' ? (
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
