import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import AdvancedPartitioning from './components/AdvancedPartitioning';
import FileSystemAutomaticPartition from './components/FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './components/FileSystemConfiguration';
import FileSystemPartition from './components/FileSystemPartition';

import { useAppSelector } from '../../../../store/hooks';
import { selectFscMode } from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';

export type FscModeType = 'automatic' | 'basic' | 'advanced';

const FileSystemStep = () => {
  const fscMode = useAppSelector(selectFscMode);
  const hasIsoTargetOnly = useHasSpecificTargetOnly('image-installer');

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        File system configuration
      </Title>
      <Content>Define the partitioning of the image.</Content>
      {hasIsoTargetOnly ? (
        <FileSystemAutomaticPartition />
      ) : fscMode === 'automatic' ? (
        <>
          <FileSystemPartition />
          <FileSystemAutomaticPartition />
        </>
      ) : fscMode === 'basic' ? (
        <>
          <FileSystemPartition />
          <FileSystemConfiguration />
        </>
      ) : (
        <>
          <FileSystemPartition />
          <AdvancedPartitioning />
        </>
      )}
    </Form>
  );
};

export default FileSystemStep;
