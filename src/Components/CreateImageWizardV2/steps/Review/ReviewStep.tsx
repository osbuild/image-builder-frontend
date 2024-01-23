import React, { useState } from 'react';

import {
  ExpandableSection,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

import {
  ContentList,
  FSCList,
  ImageDetailsList,
  ImageOutputList,
  OscapList,
  RegisterLaterList,
  RegisterNowList,
  TargetEnvAWSList,
  TargetEnvGCPList,
  TargetEnvOciList,
  TargetEnvOtherList,
} from './ReviewStepTextLists';

import isRhel from '../../../../../src/Utilities/isRhel';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
  selectDistribution,
  selectImageTypes,
  selectProfile,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

const Review = () => {
  const blueprintName = useAppSelector((state) => selectBlueprintName(state));
  const blueprintDescription = useAppSelector((state) =>
    selectBlueprintDescription(state)
  );
  const distribution = useAppSelector((state) => selectDistribution(state));
  const environments = useAppSelector((state) => selectImageTypes(state));
  const oscapProfile = useAppSelector((state) => selectProfile(state));
  const registrationType = useAppSelector((state) =>
    selectRegistrationType(state)
  );

  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(false);
  const [isExpandedTargetEnvs, setIsExpandedTargetEnvs] = useState(false);
  const [isExpandedFSC, setIsExpandedFSC] = useState(false);
  const [isExpandedContent, setIsExpandedContent] = useState(false);
  const [isExpandedRegistration, setIsExpandedRegistration] = useState(false);
  const [isExpandedImageDetail, setIsExpandedImageDetail] = useState(false);
  const [isExpandedOscapDetail, setIsExpandedOscapDetail] = useState(false);

  const onToggleImageOutput = (isExpandedImageOutput: boolean) =>
    setIsExpandedImageOutput(isExpandedImageOutput);
  const onToggleTargetEnvs = (isExpandedTargetEnvs: boolean) =>
    setIsExpandedTargetEnvs(isExpandedTargetEnvs);
  const onToggleFSC = (isExpandedFSC: boolean) =>
    setIsExpandedFSC(isExpandedFSC);
  const onToggleContent = (isExpandedContent: boolean) =>
    setIsExpandedContent(isExpandedContent);
  const onToggleRegistration = (isExpandedRegistration: boolean) =>
    setIsExpandedRegistration(isExpandedRegistration);
  const onToggleImageDetail = (isExpandedImageDetail: boolean) =>
    setIsExpandedImageDetail(isExpandedImageDetail);
  const onToggleOscapDetails = (isExpandedOscapDetail: boolean) =>
    setIsExpandedOscapDetail(isExpandedOscapDetail);

  return (
    <>
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
        {environments.includes('aws') && <TargetEnvAWSList />}
        {environments.includes('gcp') && <TargetEnvGCPList />}
        {environments.includes('oci') && <TargetEnvOciList />}
        {environments.includes('vsphere') && (
          <TextContent>
            <Text component={TextVariants.h3}>VMware vSphere (.vmdk)</Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('vsphere-ova') && (
          <TextContent>
            <Text component={TextVariants.h3}>VMware vSphere (.ova)</Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('guest-image') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              Virtualization - Guest image (.qcow2)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('image-installer') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              Bare metal - Installer (.iso)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('wsl') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              WSL - Windows Subsystem for Linux (.tar.gz)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
      </ExpandableSection>
      {isRhel(distribution) && (
        <ExpandableSection
          toggleContent={'Registration'}
          onToggle={(_event, isExpandedRegistration) =>
            onToggleRegistration(isExpandedRegistration)
          }
          isExpanded={isExpandedRegistration}
          isIndented
          data-testid="registration-expandable"
        >
          {registrationType === 'register-later' && <RegisterLaterList />}
          {registrationType.startsWith('register-now') && <RegisterNowList />}
        </ExpandableSection>
      )}
      {oscapProfile && (
        <ExpandableSection
          toggleContent={'OpenSCAP'}
          onToggle={(_event, isExpandedOscapDetail) =>
            onToggleOscapDetails(isExpandedOscapDetail)
          }
          isExpanded={isExpandedOscapDetail}
          isIndented
          data-testid="oscap-detail-expandable"
        >
          <OscapList />
        </ExpandableSection>
      )}
      <ExpandableSection
        toggleContent={'File system configuration'}
        onToggle={(_event, isExpandedFSC) => onToggleFSC(isExpandedFSC)}
        isExpanded={isExpandedFSC}
        isIndented
        data-testid="file-system-configuration-expandable"
      >
        <FSCList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={'Content'}
        onToggle={(_event, isExpandedContent) =>
          onToggleContent(isExpandedContent)
        }
        isExpanded={isExpandedContent}
        isIndented
        data-testid="content-expandable"
      >
        <ContentList />
      </ExpandableSection>
      {(blueprintName || blueprintDescription) && (
        <ExpandableSection
          toggleContent={'Image details'}
          onToggle={(_event, isExpandedImageDetail) =>
            onToggleImageDetail(isExpandedImageDetail)
          }
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

export default Review;
