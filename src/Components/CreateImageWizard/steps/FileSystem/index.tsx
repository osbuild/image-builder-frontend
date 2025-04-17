import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import FileSystemAutomaticPartition from './FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './FileSystemConfiguration';
import FileSystemPartition from './FileSystemPartition';

import { useAppSelector } from '../../../../store/hooks';
import { selectFileSystemConfigurationType } from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';
export type FileSystemConfigurationType = 'automatic' | 'manual';

const FileSystemStep = () => {
  const fileSystemConfigurationType = useAppSelector(
    selectFileSystemConfigurationType
  );
  const hasIsoTargetOnly = useHasSpecificTargetOnly('image-installer');

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        File system configuration
      </Title>
      <Text>Define the partitioning of the image.</Text>
      {hasIsoTargetOnly ? (
        <FileSystemAutomaticPartition />
      ) : fileSystemConfigurationType === 'automatic' ? (
        <>
          <FileSystemPartition />
          <FileSystemAutomaticPartition />
        </>
      ) : fileSystemConfigurationType === 'manual' ? (
        <>
          <FileSystemPartition />
          <FileSystemConfiguration />
        </>
      ) : (
        fileSystemConfigurationType === 'oscap' && <FileSystemConfiguration />
      )}
    </Form>
  );
};

export default FileSystemStep;
