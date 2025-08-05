import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import FileSystemAutomaticPartition from './components/FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './components/FileSystemConfiguration';
import FileSystemPartition from './components/FileSystemPartition';

import { useAppSelector } from '../../../../store/hooks';
import { selectFileSystemConfigurationType } from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';

export type FileSystemConfigurationType = 'automatic' | 'manual';

const FileSystemStep = () => {
  const fileSystemConfigurationType = useAppSelector(
    selectFileSystemConfigurationType,
  );
  const hasIsoTargetOnly = useHasSpecificTargetOnly('image-installer');

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        File system configuration
      </Title>
      <Content>Define the partitioning of the image.</Content>
      {hasIsoTargetOnly ? (
        <FileSystemAutomaticPartition />
      ) : fileSystemConfigurationType === 'automatic' ? (
        <>
          <FileSystemPartition />
          <FileSystemAutomaticPartition />
        </>
      ) : (
        <>
          <FileSystemPartition />
          <FileSystemConfiguration />
        </>
      )}
    </Form>
  );
};

export default FileSystemStep;
