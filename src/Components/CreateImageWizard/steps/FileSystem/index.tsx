import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import { selectFscMode } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import AdvancedPartitioning from './components/AdvancedPartitioning';
import FileSystemAutomaticPartition from './components/FileSystemAutomaticPartitionInformation';
import FileSystemConfiguration from './components/FileSystemConfiguration';
import FileSystemPartition from './components/FileSystemPartition';

// NOTE: waiting for docs to come back to us on this
// const DOCS_URL =
// 'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/deploying_and_managing_rhel_systems_in_hybrid_clouds/creating-blueprints-and-blueprint-images_host-management-services#additional-modifications-to-a-blueprint_creating-blueprints-and-blueprint-images';

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
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
        Configure the system and partitioning for your image. You can use
        automatic partitioning, manually define your own mount points and sizes,
        or use advanced partitioning for complex storage layouts. The order of
        the partitions may change when the image is installed in order to
        conform to best practices and ensure functionality.
        {
          // our existing documentation link button isn't very re-usable
          // so we have to re-implement this here. Commenting this out
          // for now while we wait for the docs team to get back to us
          // about a suitable docs link
          // !isOnPremise && (
          //   <Button
          //     component='a'
          //     target='_blank'
          //     variant='link'
          //     icon={<ExternalLinkAltIcon />}
          //     iconPosition='right'
          //     isInline
          //     href={
          //
          //       DOCS_URL
          //     }
          //   >
          //     Learn about customizing file systems
          //   </Button>
          // )
        }
      </Content>
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
