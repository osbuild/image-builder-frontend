import React, { useEffect, useMemo } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  WizardStepType,
  useWizardContext,
} from '@patternfly/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DetailsStep from './steps/Details';
import FileSystemStep from './steps/FileSystem';
import { FileSystemStepFooter } from './steps/FileSystem/FileSystemConfiguration';
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
  selectActivationKey,
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
  selectRegistrationType,
  selectStepValidation,
  addImageType,
  selectSnapshotDate,
  selectUseLatest,
} from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  disableNext: boolean;
};

export const CustomWizardFooter = ({
  disableBack: disableBack,
  disableNext: disableNext,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button
        ouiaId="wizard-next-btn"
        variant="primary"
        onClick={goToNextStep}
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
  const { isBeta } = useGetEnvironment();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // Remove this and all fallthrough logic when snapshotting is enabled in Prod-stable
  // =========================TO REMOVE=======================
  const { data, isSuccess, isFetching, isError } =
    useListFeaturesQuery(undefined);

  const snapshottingEnabled = useMemo(() => {
    if (!isBeta()) return false;
    // The below checks if other environments permit the snapshot step
    return !(
      !isError &&
      !isFetching &&
      isSuccess &&
      data?.snapshots?.accessible === false &&
      data?.snapshots?.enabled === false
    );
  }, [data, isSuccess, isFetching, isError, isBeta]);

  // =========================TO REMOVE=======================

  const firstbootFlag = useFlag('image-builder.firstboot.enabled');
  const isFirstBootEnabled = isBeta() && firstbootFlag;
  // IMPORTANT: Ensure the wizard starts with a fresh initial state
  useEffect(() => {
    dispatch(initializeWizard());
    searchParams.get('release') === 'rhel8' &&
      dispatch(changeDistribution(RHEL_8));
    searchParams.get('arch') === AARCH64 &&
      dispatch(changeArchitecture(AARCH64));
    searchParams.get('target') === 'iso' &&
      dispatch(addImageType('image-installer'));
    searchParams.get('target') === 'qcow2' &&
      dispatch(addImageType('guest-image'));
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
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);

  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);

  const snapshotStepRequiresChoice = !useLatest && !snapshotDate;

  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const onStepChange = (
    _event: React.MouseEvent<HTMLButtonElement>,
    currentStep: WizardStepType
  ) => setCurrentStep(currentStep);

  const detailsValidation = useAppSelector(selectStepValidation('details'));
  let startIndex = 1; // default index

  if (isEdit) {
    if (snapshottingEnabled) {
      startIndex = isFirstBootEnabled ? 15 : 14;
    } else {
      startIndex = isFirstBootEnabled ? 14 : 13;
    }
  }

  return (
    <>
      <ImageBuilderHeader />
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <Wizard
          startIndex={startIndex}
          onClose={() => navigate(resolveRelPath(''))}
          onStepChange={onStepChange}
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
                  registrationType !== 'register-later' && !activationKey
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
            footer={<FileSystemStepFooter />}
          >
            <FileSystemStep />
          </WizardStep>
          <WizardStep
            name="Content"
            id="step-content"
            steps={[
              ...(snapshottingEnabled
                ? [
                    <WizardStep
                      name="Repository snapshot"
                      id="wizard-repository-snapshot"
                      key="wizard-repository-snapshot"
                      footer={
                        <CustomWizardFooter
                          disableNext={snapshotStepRequiresChoice}
                        />
                      }
                    >
                      <SnapshotStep />
                    </WizardStep>,
                  ]
                : []),
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
          {isFirstBootEnabled && (
            <WizardStep
              name="First boot script configuration"
              id="wizard-first-boot"
              key="wizard-first-boot"
              footer={<CustomWizardFooter disableNext={false} />}
            >
              <FirstBootStep />
            </WizardStep>
          )}
          <WizardStep
            name="Details"
            id="step-details"
            status={
              currentStep?.id !== 'step-details' &&
              detailsValidation === 'error'
                ? 'error'
                : 'default'
            }
            isDisabled={snapshotStepRequiresChoice}
            footer={
              <CustomWizardFooter
                disableNext={detailsValidation !== 'success'}
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
      </section>
    </>
  );
};

export default CreateImageWizard;
