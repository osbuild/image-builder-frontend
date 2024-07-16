import React, { useState } from 'react';

import {
  Button,
  ExpandableSection,
  Text,
  TextContent,
  TextVariants,
  useWizardContext,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import { useFlag } from '@unleash/proxy-client-react';

import {
  ContentList,
  FSCList,
  FirstBootList,
  DetailsList,
  ImageOutputList,
  OscapList,
  RegisterLaterList,
  RegisterNowList,
  TargetEnvAWSList,
  TargetEnvAzureList,
  TargetEnvGCPList,
  TargetEnvOciList,
  TargetEnvOtherList,
} from './ReviewStepTextLists';

import isRhel from '../../../../../src/Utilities/isRhel';
import { targetOptions } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
  selectDistribution,
  selectImageTypes,
  selectProfile,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

const Review = ({ snapshottingEnabled }: { snapshottingEnabled: boolean }) => {
  const { goToStepById } = useWizardContext();

  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const distribution = useAppSelector(selectDistribution);
  const environments = useAppSelector(selectImageTypes);
  const oscapProfile = useAppSelector(selectProfile);
  const registrationType = useAppSelector(selectRegistrationType);

  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(true);
  const [isExpandedTargetEnvs, setIsExpandedTargetEnvs] = useState(true);
  const [isExpandedFSC, setIsExpandedFSC] = useState(true);
  const [isExpandedContent, setIsExpandedContent] = useState(true);
  const [isExpandedRegistration, setIsExpandedRegistration] = useState(true);
  const [isExpandedImageDetail, setIsExpandedImageDetail] = useState(true);
  const [isExpandedOscapDetail, setIsExpandedOscapDetail] = useState(true);
  const [isExpandableFirstBoot, setIsExpandedFirstBoot] = useState(true);

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
  const onToggleFirstBoot = (isExpandableFirstBoot: boolean) =>
    setIsExpandedFirstBoot(isExpandableFirstBoot);

  type RevisitStepButtonProps = {
    ariaLabel: string;
    stepId: string;
  };

  const RevisitStepButton = ({ ariaLabel, stepId }: RevisitStepButtonProps) => {
    return (
      <Button
        variant="link"
        aria-label={ariaLabel}
        component="span"
        onClick={() => revisitStep(stepId)}
        className="pf-u-p-0 pf-u-ml-xl"
        isInline
      >
        Revisit step <ArrowRightIcon />
      </Button>
    );
  };

  const revisitStep = (stepId: string) => {
    goToStepById(stepId);
  };

  const isFirstBootEnabled = useFlag('image-builder.firstboot.enabled');
  return (
    <>
      <ExpandableSection
        toggleContent={
          <>
            Image output{' '}
            <RevisitStepButton
              ariaLabel="Revisit Image output step"
              stepId="step-image-output"
            />
          </>
        }
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
        toggleContent={
          <>
            Target environments{' '}
            <RevisitStepButton
              ariaLabel="Revisit Target environments step"
              stepId="step-image-output"
            />
          </>
        }
        onToggle={(_event, isExpandedTargetEnvs) =>
          onToggleTargetEnvs(isExpandedTargetEnvs)
        }
        isExpanded={isExpandedTargetEnvs}
        isIndented
        data-testid="target-environments-expandable"
      >
        {environments.includes('aws') && <TargetEnvAWSList />}
        {environments.includes('gcp') && <TargetEnvGCPList />}
        {environments.includes('azure') && <TargetEnvAzureList />}
        {environments.includes('oci') && <TargetEnvOciList />}
        {environments.includes('vsphere') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions.vsphere} (.vmdk)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('vsphere-ova') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions['vsphere-ova']} (.ova)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('guest-image') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions['guest-image']} (.qcow2)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('image-installer') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions['image-installer']} (.iso)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('wsl') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              WSL - {targetOptions.wsl} (.tar.gz)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
      </ExpandableSection>
      {isRhel(distribution) && (
        <ExpandableSection
          toggleContent={
            <>
              Registration{' '}
              <RevisitStepButton
                ariaLabel="Revisit Registration step"
                stepId="step-register"
              />
            </>
          }
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
          toggleContent={
            <>
              OpenSCAP{' '}
              <RevisitStepButton
                ariaLabel="Revisit OpenSCAP step"
                stepId="step-oscap"
              />
            </>
          }
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
        toggleContent={
          <>
            File system configuration{' '}
            <RevisitStepButton
              ariaLabel="Revisit File system configuration step"
              stepId="step-file-system"
            />
          </>
        }
        onToggle={(_event, isExpandedFSC) => onToggleFSC(isExpandedFSC)}
        isExpanded={isExpandedFSC}
        isIndented
        data-testid="file-system-configuration-expandable"
      >
        <FSCList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={
          <>
            Content{' '}
            <RevisitStepButton
              ariaLabel="Revisit Content step"
              stepId="wizard-custom-repositories"
            />
          </>
        }
        onToggle={(_event, isExpandedContent) =>
          onToggleContent(isExpandedContent)
        }
        isExpanded={isExpandedContent}
        isIndented
        data-testid="content-expandable"
      >
        {/* Intentional prop drilling for simplicity - To be removed */}
        <ContentList snapshottingEnabled={snapshottingEnabled} />
      </ExpandableSection>
      {isFirstBootEnabled && (
        <ExpandableSection
          toggleContent={
            <>
              First boot{' '}
              <RevisitStepButton
                ariaLabel="Revisit First boot step"
                stepId="wizard-first-boot"
              />
            </>
          }
          onToggle={(_event, isExpandableFirstBoot) =>
            onToggleFirstBoot(isExpandableFirstBoot)
          }
          isExpanded={isExpandableFirstBoot}
          isIndented
          data-testid="firstboot-expandable"
        >
          <FirstBootList />
        </ExpandableSection>
      )}
      {(blueprintName || blueprintDescription) && (
        <ExpandableSection
          toggleContent={
            <>
              Details{' '}
              <RevisitStepButton
                ariaLabel="Revisit Details step"
                stepId="step-details"
              />
            </>
          }
          onToggle={(_event, isExpandedImageDetail) =>
            onToggleImageDetail(isExpandedImageDetail)
          }
          isExpanded={isExpandedImageDetail}
          isIndented
          data-testid="image-details-expandable"
        >
          <DetailsList />
        </ExpandableSection>
      )}
    </>
  );
};

export default Review;
