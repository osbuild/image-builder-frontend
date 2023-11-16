import React, { useState } from 'react';

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

import {
  ArchitectureItem,
  Distributions,
} from '../../../../store/imageBuilderApi';
import { EnvironmentStateType } from '../ImageOutput/Environment';
import { GCPAccountTypes } from '../TargetEnvironment/GCP/GCPTarget';

type ReviewStepPropTypes = {
  release: Distributions;
  arch: ArchitectureItem['arch'];
  environment: EnvironmentStateType;
  awsManual: boolean;
  awsAccountId: string;
  awsSource: [number, string];
  gcpAccountType: GCPAccountTypes;
  gcpAccountEmail: string;
  gcpDomain: string;
  azureManual: boolean;
  azureSource: [number, string];
  azureTenantId: string;
  azureSubscriptionId: string;
  azureResourceGroup: string;
};

const ReviewStep = ({
  release,
  arch,
  environment,
  awsManual,
  awsAccountId,
  awsSource,
  gcpAccountType,
  gcpAccountEmail,
  gcpDomain,
  azureManual,
  azureSource,
  azureTenantId,
  azureSubscriptionId,
  azureResourceGroup,
}: ReviewStepPropTypes) => {
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
          <ImageOutputList release={release} arch={arch} />
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
            <TargetEnvAWSList
              manual={awsManual}
              accountId={awsAccountId}
              source={awsSource}
            />
          )}
          {environment.gcp.selected && environment.gcp.authorized && (
            <TargetEnvGCPList
              accountType={gcpAccountType}
              accountEmail={gcpAccountEmail}
              domain={gcpDomain}
            />
          )}
          {environment.azure.selected && environment.azure.authorized && (
            <TargetEnvAzureList
              manual={azureManual}
              source={azureSource}
              tenantId={azureTenantId}
              subscriptionId={azureSubscriptionId}
              resourceGroup={azureResourceGroup}
            />
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
