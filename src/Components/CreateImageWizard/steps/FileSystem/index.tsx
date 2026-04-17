import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { selectFscMode } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import AdvancedPartitioning from './components/AdvancedPartitioning';
import FileSystemAutomaticPartition from './components/FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './components/FileSystemConfiguration';
import FileSystemPartition from './components/FileSystemPartition';

import { useAppSelector } from '../../../../store/hooks';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

export type FscModeType = 'automatic' | 'basic' | 'advanced';

const FileSystemStep = () => {
  const fscMode = useAppSelector(selectFscMode);
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='filesystem' />
      <Title
        headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
        size={isWizardRevampEnabled ? 'lg' : 'xl'}
      >
        File system configuration
      </Title>
      <Content>Define the partitioning of the image.</Content>
      {fscMode === 'automatic' ? (
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
    </Wrapper>
  );
};

export default FileSystemStep;
