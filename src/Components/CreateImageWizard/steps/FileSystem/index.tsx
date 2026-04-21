import React from 'react';

import { Button, Content, Form, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices';
import { selectFscMode } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import AdvancedPartitioning from './components/AdvancedPartitioning';
import FileSystemConfiguration from './components/FileSystemConfiguration';
import FileSystemPartition from './components/FileSystemPartition';

const DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/deploying_and_managing_rhel_systems_in_hybrid_clouds/index#additional-modifications-to-a-blueprint_creating-blueprints-and-blueprint-images';

export type FscModeType = 'automatic' | 'basic' | 'advanced';

const FileSystemStep = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
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
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
        Configure the system and partitioning for your image. You can use
        automatic partitioning, manually define your own mount points and sizes,
        or use advanced partitioning for complex storage layouts. The order of
        the partitions may change when the image is installed in order to
        conform to best practices and ensure functionality.
        {!isOnPremise && (
          <Button
            component='a'
            target='_blank'
            rel='noreferrer noopener'
            variant='link'
            icon={<ExternalLinkAltIcon />}
            iconPosition='right'
            isInline
            href={DOCS_URL}
          >
            Learn about customizing file systems
          </Button>
        )}
      </Content>
      {fscMode === 'automatic' ? (
        <>
          <FileSystemPartition />
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
