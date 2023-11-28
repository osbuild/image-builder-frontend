import React, { useContext, useState } from 'react';

import {
  ExpandableSection,
  Form,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';

import { ImageOutputList } from './imageOutput';
import {
  TargetEnvAWSList,
  TargetEnvAzureList,
  TargetEnvGCPList,
  TargetEnvOciList,
  TargetEnvOtherList,
} from './targetEnvironment';

import { ImageWizardContext } from '../../ImageWizardContext';

const ReviewStep = () => {
  const { environmentState } = useContext(ImageWizardContext);
  const [environment] = environmentState;
  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(false);
  const [isExpandedTargetEnvs, setIsExpandedTargetEnvs] = useState(false);

  const onToggleImageOutput = (isExpandedImageOutput: boolean) =>
    setIsExpandedImageOutput(isExpandedImageOutput);
  const onToggleTargetEnvs = (isExpandedTargetEnvs: boolean) =>
    setIsExpandedTargetEnvs(isExpandedTargetEnvs);
  return (
    <>
      <Form>
        <Title headingLevel="h2">Review</Title>
        <ExpandableSection
          toggleContent={'Image output'}
          onToggle={(_event, isExpandedImageOutput) =>
            onToggleImageOutput(isExpandedImageOutput)
          }
          isExpanded={isExpandedImageOutput}
          isIndented
          data-testid="image-output-expandable"
        >
          <ImageOutputList />
        </ExpandableSection>
        <ExpandableSection
          toggleContent={'Target environments'}
          onToggle={(_event, isExpandedTargetEnvs) =>
            onToggleTargetEnvs(isExpandedTargetEnvs)
          }
          isExpanded={isExpandedTargetEnvs}
          isIndented
          data-testid="target-environments-expandable"
        >
          {environment.aws.selected && environment.aws.authorized && (
            <TargetEnvAWSList />
          )}
          {environment.gcp.selected && environment.gcp.authorized && (
            <TargetEnvGCPList />
          )}
          {environment.azure.selected && environment.azure.authorized && (
            <TargetEnvAzureList />
          )}
          {environment.oci.selected && environment.oci.authorized && (
            <TargetEnvOciList />
          )}
          {environment.vsphere.selected && environment.vsphere.authorized && (
            <TextContent>
              <Text component={TextVariants.h3}>VMWare vSphere (.vmdk)</Text>
              <TargetEnvOtherList />
            </TextContent>
          )}
          {environment['vsphere-ova'].selected &&
            environment['vsphere-ova'].authorized && (
              <TextContent>
                <Text component={TextVariants.h3}>VMWare vSphere (.ova)</Text>
                <TargetEnvOtherList />
              </TextContent>
            )}
          {environment['guest-image'].selected &&
            environment['guest-image'].authorized && (
              <TextContent>
                <Text component={TextVariants.h3}>
                  Virtualization - Guest image (.qcow2)
                </Text>
                <TargetEnvOtherList />
              </TextContent>
            )}
          {environment['image-installer'].selected &&
            environment['image-installer'].authorized && (
              <TextContent>
                <Text component={TextVariants.h3}>
                  Bare metal - Installer (.iso)
                </Text>
                <TargetEnvOtherList />
              </TextContent>
            )}
          {environment.wsl.selected && environment.wsl.authorized && (
            <TextContent>
              <Text component={TextVariants.h3}>
                WSL - Windows Subsystem for Linux (.tar.gz)
              </Text>
              <TargetEnvOtherList />
            </TextContent>
          )}
        </ExpandableSection>
      </Form>
    </>
  );
};

export default ReviewStep;
