import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardNavItem,
  WizardStep,
  useWizardContext,
  PageSection,
} from '@patternfly/react-core';
import { WizardStepType } from '@patternfly/react-core/dist/esm/components/Wizard';
import { useFlag } from '@unleash/proxy-client-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DetailsStep from './steps/Details';
import FileSystemStep, { FileSystemContext } from './steps/FileSystem';
import FirstBootStep from './steps/FirstBoot';
import ImageOutputStep from './steps/ImageOutput';
import OscapStep from './steps/Oscap';
import PackagesStep from './steps/Packages';
import RegistrationStep from './steps/Registration';
import RepositoriesStep from './steps/Repositories';
import ReviewStep from './steps/Review';
import ReviewWizardFooter from './steps/Review/Footer/Footer';
import SnapshotStep from './steps/Snapshot';
import Aws from './steps/TargetEnvironment/Aws';
import Azure from './steps/TargetEnvironment/Azure';
import Gcp from './steps/TargetEnvironment/Gcp';
import {
  useFilesystemValidation,
  useFirstBootValidation,
  useDetailsValidation,
} from './utilities/useValidation';
import {
  isAwsAccountIdValid,
  isAzureTenantGUIDValid,
  isAzureSubscriptionIdValid,
  isAzureResourceGroupValid,
  isGcpEmailValid,
} from './validators';

import { RHEL_8, AARCH64 } from '../../constants';
import { useListFeaturesQuery } from '../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './CreateImageWizard.scss';
import {
  changeDistribution,
  changeArchitecture,
  initializeWizard,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAwsSourceId,
  selectAzureResourceGroup,
  selectAzureShareMethod,
  selectAzureSource,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectGcpEmail,
  selectGcpShareMethod,
  selectImageTypes,
  addImageType,
  selectSnapshotDate,
  selectUseLatest,
  selectRegistrationType,
  selectActivationKey,
} from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  disableNext: boolean;
  beforeNext?: () => boolean;
};

export const CustomWizardFooter = ({
  disableBack: disableBack,
  disableNext: disableNext,
  beforeNext,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button
        ouiaId="wizard-next-btn"
        variant="primary"
        onClick={() => {
          if (!beforeNext || beforeNext()) goToNextStep();
        }}
        isDisabled={disableNext}
      >
        Next
      </Button>
      <Button
        ouiaId="wizard-back-btn"
        variant="secondary"
        onClick={goToPrevStep}
        isDisabled={disableBack}
      >
        Back
      </Button>
      <Button ouiaId="wizard-cancel-btn" variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

type CreateImageWizardProps = {
  isEdit?: boolean;
};

const CreateImageWizard = ({ isEdit }: CreateImageWizardProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // Remove this and all fallthrough logic when snapshotting is enabled in Prod-stable
  // =========================TO REMOVE=======================
  const { data, isSuccess, isFetching, isError } =
    useListFeaturesQuery(undefined);

  const snapshotsFlag = useFlag('image-builder.snapshots.enabled');

  const snapshottingEnabled = useMemo(() => {
    if (!snapshotsFlag) return false;
    // The below checks if other environments permit the snapshot step
    return !(
      !isError &&
      !isFetching &&
      isSuccess &&
      data?.snapshots?.accessible === false &&
      data?.snapshots?.enabled === false
    );
  }, [data, isSuccess, isFetching, isError, snapshotsFlag]);

  // =========================TO REMOVE=======================

  const isFirstBootEnabled = useFlag('image-builder.firstboot.enabled');
  // IMPORTANT: Ensure the wizard starts with a fresh initial state
  useEffect(() => {
    dispatch(initializeWizard());
    if (searchParams.get('release') === 'rhel8') {
      dispatch(changeDistribution(RHEL_8));
    }
    if (searchParams.get('arch') === AARCH64) {
      dispatch(changeArchitecture(AARCH64));
    }
    if (searchParams.get('target') === 'iso') {
      dispatch(addImageType('image-installer'));
    }
    if (searchParams.get('target') === 'qcow2') {
      dispatch(addImageType('guest-image'));
    }
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*           *
   * Selectors *
   *           */

  // Image Output
  const targetEnvironments = useAppSelector(selectImageTypes);
  // AWS
  const awsShareMethod = useAppSelector(selectAwsShareMethod);
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const awsSourceId = useAppSelector(selectAwsSourceId);
  // GCP
  const gcpShareMethod = useAppSelector(selectGcpShareMethod);
  const gcpEmail = useAppSelector(selectGcpEmail);
  // AZURE
  const azureShareMethod = useAppSelector(selectAzureShareMethod);
  const azureTenantId = useAppSelector(selectAzureTenantId);
  const azureSubscriptionId = useAppSelector(selectAzureSubscriptionId);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const azureSource = useAppSelector(selectAzureSource);
  // Registration
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);
  // Snapshots
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);
  const snapshotStepRequiresChoice = !useLatest && !snapshotDate;
  // Filesystem
  const [filesystemPristine, setFilesystemPristine] = useState(true);
  const fileSystemValidation = useFilesystemValidation();
  // Firstboot
  const firstBootValidation = useFirstBootValidation();
  // Details
  const detailsValidation = useDetailsValidation();

  let startIndex = 1; // default index
  if (isEdit) {
    startIndex = 15;
  }

  // Duplicating some of the logic from the Wizard component to allow for custom nav items status
  // for original code see https://github.com/patternfly/patternfly-react/blob/184c55f8d10e1d94ffd72e09212db56c15387c5e/packages/react-core/src/components/Wizard/WizardNavInternal.tsx#L128
  const customStatusNavItem = (
    step: WizardStepType,
    activeStep: WizardStepType,
    steps: WizardStepType[],
    goToStepByIndex: (index: number) => void
  ) => {
    const isVisitRequired = true;
    const hasVisitedNextStep = steps.some(
      (s) => s.index > step.index && s.isVisited
    );

    // Only this code is different from the original
    const status =
      (step.isVisited && step.id !== activeStep?.id && step.status) ||
      'default';

    return (
      <WizardNavItem
        key={step.id}
        id={step.id}
        content={step.name}
        isCurrent={activeStep?.id === step.id}
        isDisabled={
          step.isDisabled ||
          (isVisitRequired && !step.isVisited && !hasVisitedNextStep)
        }
        isVisited={step.isVisited}
        stepIndex={step.index}
        onClick={() => goToStepByIndex(step.index)}
        status={status}
      />
    );
  };

  return (
    <>
      <ImageBuilderHeader inWizard />
      <PageSection isWidthLimited>
        <Wizard
          startIndex={startIndex}
          onClose={() => navigate(resolveRelPath(''))}
          isVisitRequired
        >
          <WizardStep
            name="Image output"
            id="step-image-output"
            footer={
              <CustomWizardFooter
                disableNext={targetEnvironments.length === 0}
                disableBack={true}
              />
            }
          >
            <ImageOutputStep />
          </WizardStep>
          <WizardStep
            name="Target Environment"
            id="step-target-environment"
            isHidden={
              !targetEnvironments.find(
                (target) =>
                  target === 'aws' || target === 'gcp' || target === 'azure'
              )
            }
            steps={[
              <WizardStep
                name="Amazon Web Services"
                id="wizard-target-aws"
                key="wizard-target-aws"
                footer={
                  <CustomWizardFooter
                    disableNext={
                      awsShareMethod === 'manual'
                        ? !isAwsAccountIdValid(awsAccountId)
                        : awsSourceId === undefined
                    }
                  />
                }
                isHidden={!targetEnvironments.includes('aws')}
              >
                <Aws />
              </WizardStep>,
              <WizardStep
                name="Google Cloud Platform"
                id="wizard-target-gcp"
                key="wizard-target-gcp"
                footer={
                  <CustomWizardFooter
                    disableNext={
                      gcpShareMethod === 'withGoogle' &&
                      !isGcpEmailValid(gcpEmail)
                    }
                  />
                }
                isHidden={!targetEnvironments.includes('gcp')}
              >
                <Gcp />
              </WizardStep>,
              <WizardStep
                name="Azure"
                id="wizard-target-azure"
                key="wizard-target-azure"
                footer={
                  <CustomWizardFooter
                    disableNext={
                      azureShareMethod === 'manual'
                        ? !isAzureTenantGUIDValid(azureTenantId) ||
                          !isAzureSubscriptionIdValid(azureSubscriptionId) ||
                          !isAzureResourceGroupValid(azureResourceGroup)
                        : azureShareMethod === 'sources'
                        ? !isAzureTenantGUIDValid(azureTenantId) ||
                          !isAzureSubscriptionIdValid(azureSubscriptionId) ||
                          !isAzureResourceGroupValid(azureResourceGroup)
                        : azureSource === undefined
                    }
                  />
                }
                isHidden={!targetEnvironments.includes('azure')}
              >
                <Azure />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name="Register"
            id="step-register"
            footer={
              <CustomWizardFooter
                disableNext={
                  registrationType.startsWith('register-now') && !activationKey
                }
              />
            }
          >
            <RegistrationStep />
          </WizardStep>
          <WizardStep
            name="OpenSCAP"
            id="step-oscap"
            footer={<CustomWizardFooter disableNext={false} />}
          >
            <OscapStep />
          </WizardStep>
          <WizardStep
            name="File system configuration"
            id="step-file-system"
            footer={
              <CustomWizardFooter
                beforeNext={() => {
                  if (fileSystemValidation.disabledNext) {
                    setFilesystemPristine(false);
                    return false;
                  }
                  return true;
                }}
                disableNext={
                  !filesystemPristine && fileSystemValidation.disabledNext
                }
              />
            }
          >
            <FileSystemContext.Provider value={filesystemPristine}>
              <FileSystemStep />
            </FileSystemContext.Provider>
          </WizardStep>
          <WizardStep
            name="Content"
            id="step-content"
            steps={[
              <WizardStep
                name="Repository snapshot"
                id="wizard-repository-snapshot"
                key="wizard-repository-snapshot"
                isHidden={!snapshottingEnabled}
                footer={
                  <CustomWizardFooter
                    disableNext={snapshotStepRequiresChoice}
                  />
                }
              >
                <SnapshotStep />
              </WizardStep>,
              <WizardStep
                name="Custom repositories"
                id="wizard-custom-repositories"
                key="wizard-custom-repositories"
                isDisabled={snapshotStepRequiresChoice}
                footer={<CustomWizardFooter disableNext={false} />}
              >
                <RepositoriesStep />
              </WizardStep>,
              <WizardStep
                name="Additional packages"
                id="wizard-additional-packages"
                key="wizard-additional-packages"
                isDisabled={snapshotStepRequiresChoice}
                footer={<CustomWizardFooter disableNext={false} />}
              >
                <PackagesStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name="First boot script configuration"
            id="wizard-first-boot"
            key="wizard-first-boot"
            navItem={customStatusNavItem}
            status={firstBootValidation.disabledNext ? 'error' : 'default'}
            isHidden={!isFirstBootEnabled}
            footer={
              <CustomWizardFooter
                disableNext={firstBootValidation.disabledNext}
              />
            }
          >
            <FirstBootStep />
          </WizardStep>
          <WizardStep
            name="Details"
            id={'step-details'}
            isDisabled={snapshotStepRequiresChoice}
            navItem={customStatusNavItem}
            status={detailsValidation.disabledNext ? 'error' : 'default'}
            footer={
              <CustomWizardFooter
                disableNext={detailsValidation.disabledNext}
              />
            }
          >
            <DetailsStep />
          </WizardStep>
          <WizardStep
            name="Review"
            id="step-review"
            isDisabled={snapshotStepRequiresChoice}
            footer={<ReviewWizardFooter />}
          >
            {/* Intentional prop drilling for simplicity - To be removed */}
            <ReviewStep snapshottingEnabled={snapshottingEnabled} />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};

export default CreateImageWizard;
