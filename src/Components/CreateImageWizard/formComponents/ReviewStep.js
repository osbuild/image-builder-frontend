import React, { useEffect, useState } from 'react';

import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  ExpandableSection,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import {
  ContentList,
  FSCList,
  ImageDetailsList,
  ImageOutputList,
  RegisterLaterList,
  RegisterNowList,
  TargetEnvAWSList,
  TargetEnvAzureList,
  TargetEnvGCPList,
  TargetEnvOtherList,
} from './ReviewStepTextLists';

import isRhel from '../../../Utilities/isRhel';

const ReviewStep = () => {
  const { auth } = useChrome();
  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(false);
  const [isExpandedTargetEnvs, setIsExpandedTargetEnvs] = useState(false);
  const [isExpandedFSC, setIsExpandedFSC] = useState(false);
  const [isExpandedContent, setIsExpandedContent] = useState(false);
  const [isExpandedRegistration, setIsExpandedRegistration] = useState(false);
  const [isExpandedImageDetail, setIsExpandedImageDetail] = useState(false);
  const { change, getState } = useFormApi();

  useEffect(() => {
    const registerSystem = getState()?.values?.['register-system'];
    if (registerSystem?.startsWith('register-now')) {
      (async () => {
        const userData = await auth?.getUser();
        const id = userData?.identity?.internal?.org_id;
        change('subscription-organization-id', id);
      })();
    }
  });

  const onToggleImageOutput = (isExpandedImageOutput) =>
    setIsExpandedImageOutput(isExpandedImageOutput);
  const onToggleTargetEnvs = (isExpandedTargetEnvs) =>
    setIsExpandedTargetEnvs(isExpandedTargetEnvs);
  const onToggleFSC = (isExpandedFSC) => setIsExpandedFSC(isExpandedFSC);
  const onToggleContent = (isExpandedContent) =>
    setIsExpandedContent(isExpandedContent);
  const onToggleRegistration = (isExpandedRegistration) =>
    setIsExpandedRegistration(isExpandedRegistration);
  const onToggleImageDetail = (isExpandedImageDetail) =>
    setIsExpandedImageDetail(isExpandedImageDetail);

  return (
    <>
      <ExpandableSection
        toggleContent={'Image output'}
        onToggle={onToggleImageOutput}
        isExpanded={isExpandedImageOutput}
        isIndented
        data-testid="image-output-expandable"
      >
        <ImageOutputList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={'Target environments'}
        onToggle={onToggleTargetEnvs}
        isExpanded={isExpandedTargetEnvs}
        isIndented
        data-testid="target-environments-expandable"
      >
        {getState()?.values?.['target-environment']?.aws && (
          <TargetEnvAWSList />
        )}
        {getState()?.values?.['target-environment']?.gcp && (
          <TargetEnvGCPList />
        )}
        {getState()?.values?.['target-environment']?.azure && (
          <TargetEnvAzureList />
        )}
        {getState()?.values?.['target-environment']?.vsphere && (
          <TextContent>
            <Text component={TextVariants.h3}>VMWare (.vmdk)</Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {getState()?.values?.['target-environment']?.['guest-image'] && (
          <TextContent>
            <Text component={TextVariants.h3}>
              Virtualization - Guest image (.qcow2)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {getState()?.values?.['target-environment']?.['image-installer'] && (
          <TextContent>
            <Text component={TextVariants.h3}>
              Bare metal - Installer (.iso)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
      </ExpandableSection>
      <ExpandableSection
        toggleContent={'File system configuration'}
        onToggle={onToggleFSC}
        isExpanded={isExpandedFSC}
        isIndented
        data-testid="file-system-configuration-expandable"
      >
        <FSCList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={'Content'}
        onToggle={onToggleContent}
        isExpanded={isExpandedContent}
        isIndented
        data-testid="content-expandable"
      >
        <ContentList />
      </ExpandableSection>
      {isRhel(getState()?.values?.release) && (
        <ExpandableSection
          toggleContent={'Registration'}
          onToggle={onToggleRegistration}
          isExpanded={isExpandedRegistration}
          isIndented
          data-testid="registration-expandable"
        >
          {getState()?.values?.['register-system'] === 'register-later' && (
            <RegisterLaterList />
          )}
          {getState()?.values?.['register-system']?.startsWith(
            'register-now'
          ) && <RegisterNowList />}
        </ExpandableSection>
      )}
      {getState()?.values?.['image-name'] && (
        <ExpandableSection
          toggleContent={'Image details'}
          onToggle={onToggleImageDetail}
          isExpanded={isExpandedImageDetail}
          isIndented
          data-testid="image-details-expandable"
        >
          <ImageDetailsList />
        </ExpandableSection>
      )}
    </>
  );
};

export default ReviewStep;
