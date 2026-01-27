import React, { useEffect, useRef, useState } from 'react';

import {
  Button,
  Flex,
  PageSection,
  PageSectionTypes,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardNavItem,
  WizardStep,
} from '@patternfly/react-core';
import { WizardStepType } from '@patternfly/react-core/dist/esm/components/Wizard';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AAPStep from './steps/AAP';
import DetailsStep from './steps/Details';
import FileSystemStep from './steps/FileSystem';
import { FileSystemContext } from './steps/FileSystem/components/Row';
import FirewallStep from './steps/Firewall';
import FirstBootStep from './steps/FirstBoot';
import HostnameStep from './steps/Hostname';
import ImageOutputStep from './steps/ImageOutput';
import KernelStep from './steps/Kernel';
import LocaleStep from './steps/Locale';
import OscapStep from './steps/Oscap';
import PackagesStep from './steps/Packages';
import RegistrationStep from './steps/Registration';
import RepositoriesStep from './steps/Repositories';
import ReviewStep from './steps/Review';
import ReviewWizardFooter from './steps/Review/Footer/Footer';
import ServicesStep from './steps/Services';
import SnapshotStep from './steps/Snapshot';
import Aws from './steps/TargetEnvironment/Aws';
import Azure from './steps/TargetEnvironment/Azure';
import Gcp from './steps/TargetEnvironment/Gcp';
import TimezoneStep from './steps/Timezone';
import UsersStep from './steps/Users';
import {
  useAAPValidation,
  useAzureValidation,
  useDetailsValidation,
  useFilesystemValidation,
  useFirewallValidation,
  useFirstBootValidation,
  useHostnameValidation,
  useKernelValidation,
  useLocaleValidation,
  useRegistrationValidation,
  useServicesValidation,
  useSnapshotValidation,
  useTimezoneValidation,
  useUserGroupsValidation,
  useUsersValidation,
} from './utilities/useValidation';
import {
  isAwsAccountIdValid,
  isGcpDomainValid,
  isGcpEmailValid,
} from './validators';

import {
  AARCH64,
  AMPLITUDE_MODULE_NAME,
  RHEL_10,
  RHEL_8,
  RHEL_9,
} from '../../constants';
import { useGetUser, useIsOnPremise } from '../../Hooks';
import { useCustomizationRestrictions } from '../../store/distributions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './CreateImageWizard.scss';
import {
  addImageType,
  changeArchitecture,
  changeAwsShareMethod,
  changeDistribution,
  changeTimezone,
  initializeWizard,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAwsSourceId,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectBlueprintMode,
  selectDistribution,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectImageTypes,
  selectTimezone,
} from '../../store/wizardSlice';
import { getHostArch, getHostDistro } from '../../Utilities/getHostInfo';
import isRhel from '../../Utilities/isRhel';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  disableNext: boolean;
  beforeNext?: () => boolean;
  optional?: boolean;
  isOnPremise: boolean;
};

export const CustomWizardFooter = ({
  disableBack: disableBack,
  disableNext: disableNext,
  beforeNext,
  optional: optional,
  isOnPremise,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, goToStepById, close, activeStep } =
    useWizardContext();
  const { analytics } = useChrome();
  const reviewAndFinishBtnID = 'wizard-review-and-finish-btn';
  const cancelBtnID = 'wizard-cancel-btn';
  return (
    <WizardFooterWrapper>
      <Flex columnGap={{ default: 'columnGapSm' }}>
        <Button
          variant='primary'
          onClick={() => {
            if (!beforeNext || beforeNext()) goToNextStep();
          }}
          isDisabled={disableNext}
        >
          Next
        </Button>
        <Button
          variant='secondary'
          onClick={() => {
            goToPrevStep();
          }}
          isDisabled={disableBack || false}
        >
          Back
        </Button>
        {optional && (
          <Button
            variant='tertiary'
            onClick={() => {
              if (!isOnPremise) {
                analytics.track(`${AMPLITUDE_MODULE_NAME} - Button Clicked`, {
                  module: AMPLITUDE_MODULE_NAME,
                  button_id: reviewAndFinishBtnID,
                  active_step_id: activeStep.id,
                });
              }
              if (!beforeNext || beforeNext()) goToStepById('step-review');
            }}
            isDisabled={disableNext}
          >
            Review and finish
          </Button>
        )}
        <Button
          variant='link'
          onClick={() => {
            if (!isOnPremise) {
              analytics.track(`${AMPLITUDE_MODULE_NAME} - Button Clicked`, {
                module: AMPLITUDE_MODULE_NAME,
                button_id: cancelBtnID,
                active_step_id: activeStep.id,
              });
            }
            close();
          }}
        >
          Cancel
        </Button>
      </Flex>
    </WizardFooterWrapper>
  );
};

type CreateImageWizardProps = {
  isEdit?: boolean;
};

const CreateImageWizard = ({ isEdit }: CreateImageWizardProps) => {
  const { analytics, auth, isBeta } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useIsOnPremise();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const imageTypes = useAppSelector(selectImageTypes);
  const [searchParams] = useSearchParams();

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: imageTypes,
  });

  // IMPORTANT: Ensure the wizard starts with a fresh initial state
  useEffect(() => {
    dispatch(initializeWizard());
    if (searchParams.get('release') === 'rhel8') {
      dispatch(changeDistribution(RHEL_8));
    }
    if (searchParams.get('release') === 'rhel9') {
      dispatch(changeDistribution(RHEL_9));
    }
    if (searchParams.get('release') === 'rhel10') {
      dispatch(changeDistribution(RHEL_10));
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

    const initializeHostDistro = async () => {
      const distro = await getHostDistro();
      dispatch(changeDistribution(distro));
    };

    const initializeHostArch = async () => {
      const arch = await getHostArch();
      dispatch(changeArchitecture(arch));
    };

    if (isOnPremise) {
      dispatch(changeAwsShareMethod('manual'));
    }

    if (isOnPremise && !isEdit) {
      if (!searchParams.get('release')) {
        initializeHostDistro();
      }
      initializeHostArch();
    }
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*           *
   * Selectors *
   *           */

  const distribution = useAppSelector(selectDistribution);
  const timezone = useAppSelector(selectTimezone);

  // Image Output
  const targetEnvironments = useAppSelector(selectImageTypes);
  // AWS
  const awsShareMethod = useAppSelector(selectAwsShareMethod);
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const awsSourceId = useAppSelector(selectAwsSourceId);
  // GCP
  const gcpShareMethod = useAppSelector(selectGcpShareMethod);
  const gcpAccountType = useAppSelector(selectGcpAccountType);
  const gcpEmail = useAppSelector(selectGcpEmail);
  // AZURE
  const azureTenantId = useAppSelector(selectAzureTenantId);
  const azureSubscriptionId = useAppSelector(selectAzureSubscriptionId);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const azureValidation = useAzureValidation();
  // Registration
  const registrationValidation = useRegistrationValidation();
  // Snapshots
  const snapshotValidation = useSnapshotValidation();
  // Filesystem
  const fileSystemValidation = useFilesystemValidation();
  const [filesystemPristine, setFilesystemPristine] = useState(
    fileSystemValidation.disabledNext,
  );
  // Timezone
  const timezoneValidation = useTimezoneValidation();
  // Locale
  const localeValidation = useLocaleValidation();
  // Hostname
  const hostnameValidation = useHostnameValidation();
  // Kernel
  const kernelValidation = useKernelValidation();
  // Firewall
  const firewallValidation = useFirewallValidation();
  // Services
  const servicesValidation = useServicesValidation();
  // AAP
  const aapValidation = useAAPValidation();
  // Firstboot
  const firstBootValidation = useFirstBootValidation();
  // Details
  const detailsValidation = useDetailsValidation();
  // Users
  const usersValidation = useUsersValidation();
  const userGroupsValidation = useUserGroupsValidation();
  const [usersStepAttemptedNext, setUsersStepAttemptedNext] = useState(false);

  // Reset attemptedNext when errors are fixed
  useEffect(() => {
    if (
      !usersValidation.disabledNext &&
      !userGroupsValidation.disabledNext &&
      usersStepAttemptedNext
    ) {
      setUsersStepAttemptedNext(false);
    }
  }, [
    usersValidation.disabledNext,
    userGroupsValidation.disabledNext,
    usersStepAttemptedNext,
  ]);

  let startIndex = 1; // default index
  const JUMP_TO_REVIEW_STEP = 24;

  if (isEdit) {
    startIndex = JUMP_TO_REVIEW_STEP;
  }

  const [wasRegisterVisited, setWasRegisterVisited] = useState(false);
  const [wasUsersVisited, setWasUsersVisited] = useState(false);
  const lastTrackedStepIdRef = useRef<string | undefined>();

  useEffect(() => {
    if (isEdit) {
      return;
    }

    const defaultTimezone =
      distribution === RHEL_10 || targetEnvironments.includes('azure')
        ? 'Etc/UTC'
        : 'America/New_York';

    if (!timezone) {
      dispatch(changeTimezone(defaultTimezone));
    }
  }, [distribution, targetEnvironments, isEdit, dispatch]);

  // Duplicating some of the logic from the Wizard component to allow for custom nav items status
  // for original code see https://github.com/patternfly/patternfly-react/blob/184c55f8d10e1d94ffd72e09212db56c15387c5e/packages/react-core/src/components/Wizard/WizardNavInternal.tsx#L128
  const CustomStatusNavItem = (
    step: WizardStepType,
    activeStep: WizardStepType,
    steps: WizardStepType[],
    goToStepByIndex: (index: number) => void,
  ) => {
    const isVisitOptional =
      'parentId' in step && step.parentId === 'step-optional-steps';

    useEffect(() => {
      if (!isRhel(distribution)) {
        if (step.id === 'step-oscap' && step.isVisited) {
          setWasRegisterVisited(true);
        }
      } else if (step.id === 'step-register' && step.isVisited) {
        setWasRegisterVisited(true);
      } else if (step.id === 'wizard-users' && step.isVisited) {
        setWasUsersVisited(true);
      }
    }, [step.id, step.isVisited]);

    const hasVisitedNextStep = steps.some(
      (s) => s.index > step.index && s.isVisited,
    );

    const status = (step.id !== activeStep.id && step.status) || 'default';

    useEffect(() => {
      const currentStepId = activeStep.id as string | undefined;
      if (
        !isOnPremise &&
        currentStepId &&
        lastTrackedStepIdRef.current !== currentStepId
      ) {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Step Viewed`, {
          module: AMPLITUDE_MODULE_NAME,
          step_id: currentStepId,
          account_id: userData?.identity.internal?.account_id || 'Not found',
          from_step_id: lastTrackedStepIdRef.current,
        });
        lastTrackedStepIdRef.current = currentStepId;
      }
    }, [activeStep.id]);

    return (
      <WizardNavItem
        key={step.id}
        id={step.id}
        content={step.name}
        isCurrent={activeStep.id === step.id}
        isDisabled={
          step.isDisabled ||
          (!step.isVisited &&
            !hasVisitedNextStep &&
            !(isVisitOptional && wasRegisterVisited))
        }
        isVisited={step.isVisited || false}
        stepIndex={step.index}
        onClick={() => {
          goToStepByIndex(step.index);
          if (
            !isOnPremise &&
            isEdit &&
            step.id === 'wizard-additional-packages'
          ) {
            analytics.track(
              `${AMPLITUDE_MODULE_NAME} - Additional Packages Revisited in Edit`,
              {
                module: AMPLITUDE_MODULE_NAME,
                isPreview: isBeta(),
              },
            );
          }
        }}
        status={status}
      />
    );
  };

  const isImageMode = blueprintMode === 'image';

  return (
    <>
      <ImageBuilderHeader inWizard />
      <PageSection
        hasBodyWrapper={false}
        type={PageSectionTypes.wizard}
        className='create-image-wizard'
      >
        <Wizard
          startIndex={startIndex}
          onClose={() => navigate(resolveRelPath(''))}
          isVisitRequired
        >
          <WizardStep
            name='Image output'
            id='step-image-output'
            footer={
              <CustomWizardFooter
                disableNext={targetEnvironments.length === 0}
                disableBack={true}
                isOnPremise={isOnPremise}
              />
            }
          >
            <ImageOutputStep />
          </WizardStep>
          <WizardStep
            name='Target Environment'
            id='step-target-environment'
            isHidden={
              !targetEnvironments.find(
                (target: string) =>
                  target === 'aws' || target === 'gcp' || target === 'azure',
              )
            }
            steps={[
              <WizardStep
                name='Amazon Web Services'
                id='wizard-target-aws'
                key='wizard-target-aws'
                footer={
                  <CustomWizardFooter
                    disableNext={
                      // we don't need the account id for
                      // on-prem aws.
                      isOnPremise
                        ? false
                        : awsShareMethod === 'manual'
                          ? !isAwsAccountIdValid(awsAccountId)
                          : awsSourceId === undefined
                    }
                    isOnPremise={isOnPremise}
                  />
                }
                isHidden={!targetEnvironments.includes('aws')}
              >
                <Aws />
              </WizardStep>,
              <WizardStep
                name='Google Cloud'
                id='wizard-target-gcp'
                key='wizard-target-gcp'
                footer={
                  <CustomWizardFooter
                    disableNext={
                      gcpShareMethod === 'withGoogle' &&
                      !(gcpAccountType === 'domain'
                        ? isGcpDomainValid(gcpEmail)
                        : isGcpEmailValid(gcpEmail))
                    }
                    isOnPremise={isOnPremise}
                  />
                }
                isHidden={!targetEnvironments.includes('gcp')}
              >
                <Gcp />
              </WizardStep>,
              <WizardStep
                name='Azure'
                id='wizard-target-azure'
                key='wizard-target-azure'
                status={azureValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={
                      azureResourceGroup === undefined ||
                      azureSubscriptionId === undefined ||
                      azureTenantId === undefined ||
                      azureValidation.disabledNext
                    }
                    isOnPremise={isOnPremise}
                  />
                }
                isHidden={!targetEnvironments.includes('azure')}
              >
                <Azure />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name='Groups and users'
            id='wizard-users'
            key='wizard-users'
            isHidden={!isImageMode}
            navItem={CustomStatusNavItem}
            status={
              wasUsersVisited
                ? usersValidation.disabledNext ||
                  userGroupsValidation.disabledNext
                  ? 'error'
                  : 'default'
                : 'default'
            }
            footer={
              <CustomWizardFooter
                beforeNext={() => {
                  if (
                    usersValidation.disabledNext ||
                    userGroupsValidation.disabledNext
                  ) {
                    setUsersStepAttemptedNext(true);
                    return false;
                  }
                  return true;
                }}
                disableNext={
                  usersValidation.disabledNext ||
                  userGroupsValidation.disabledNext
                }
                isOnPremise={isOnPremise}
              />
            }
          >
            <UsersStep attemptedNext={usersStepAttemptedNext} />
          </WizardStep>
          <WizardStep
            name='Optional steps'
            id='step-optional-steps'
            steps={[
              <WizardStep
                name='Register'
                id='step-register'
                key='step-register'
                isHidden={!isRhel(distribution)}
                navItem={CustomStatusNavItem}
                status={
                  wasRegisterVisited
                    ? registrationValidation.disabledNext
                      ? 'error'
                      : 'default'
                    : 'default'
                }
                footer={
                  <CustomWizardFooter
                    disableNext={registrationValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <RegistrationStep />
              </WizardStep>,
              <WizardStep
                name='Security'
                id='step-oscap'
                key='step-oscap'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.openscap.shouldHide
                }
                navItem={CustomStatusNavItem}
                footer={
                  <CustomWizardFooter
                    disableNext={false}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <OscapStep />
              </WizardStep>,
              <WizardStep
                name='File system configuration'
                id='step-file-system'
                key='step-file-system'
                navItem={CustomStatusNavItem}
                isHidden={restrictions.filesystem.shouldHide}
                status={
                  !filesystemPristine && fileSystemValidation.disabledNext
                    ? 'error'
                    : 'default'
                }
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
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <FileSystemContext.Provider value={filesystemPristine}>
                  <FileSystemStep />
                </FileSystemContext.Provider>
              </WizardStep>,
              <WizardStep
                name='Repeatable build'
                id='wizard-repository-snapshot'
                key='wizard-repository-snapshot'
                navItem={CustomStatusNavItem}
                status={snapshotValidation.disabledNext ? 'error' : 'default'}
                isHidden={
                  // TODO: maybe move the isImageMode & isOnPremise into the customizationRestrictions query transformation
                  isOnPremise ||
                  isImageMode ||
                  restrictions.repositories.shouldHide
                }
                footer={
                  <CustomWizardFooter
                    disableNext={snapshotValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <SnapshotStep />
              </WizardStep>,
              <WizardStep
                name='Repositories'
                id='wizard-custom-repositories'
                key='wizard-custom-repositories'
                navItem={CustomStatusNavItem}
                isHidden={
                  // TODO: maybe move the isImageMode & isOnPremise into the customizationRestrictions query transformation
                  isOnPremise ||
                  isImageMode ||
                  restrictions.repositories.shouldHide
                }
                isDisabled={snapshotValidation.disabledNext}
                footer={
                  <CustomWizardFooter
                    disableNext={false}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <RepositoriesStep />
              </WizardStep>,
              <WizardStep
                name='Additional packages'
                id='wizard-additional-packages'
                key='wizard-additional-packages'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.packages.shouldHide
                }
                navItem={CustomStatusNavItem}
                isDisabled={snapshotValidation.disabledNext}
                footer={
                  <CustomWizardFooter
                    disableNext={false}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <PackagesStep />
              </WizardStep>,
              <WizardStep
                name='Groups and users'
                id='wizard-users-optional'
                key='wizard-users-optional'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.users.shouldHide
                }
                navItem={CustomStatusNavItem}
                status={
                  usersValidation.disabledNext ||
                  userGroupsValidation.disabledNext
                    ? 'error'
                    : 'default'
                }
                footer={
                  <CustomWizardFooter
                    disableNext={
                      usersStepAttemptedNext &&
                      (usersValidation.disabledNext ||
                        userGroupsValidation.disabledNext)
                    }
                    beforeNext={() => {
                      if (
                        usersValidation.disabledNext ||
                        userGroupsValidation.disabledNext
                      ) {
                        setUsersStepAttemptedNext(true);
                        return false;
                      }
                      return true;
                    }}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <UsersStep attemptedNext={usersStepAttemptedNext} />
              </WizardStep>,
              <WizardStep
                name='Timezone'
                id='wizard-timezone'
                key='wizard-timezone'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.timezone.shouldHide
                }
                navItem={CustomStatusNavItem}
                status={timezoneValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={timezoneValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <TimezoneStep />
              </WizardStep>,
              <WizardStep
                name='Locale'
                id='wizard-locale'
                key='wizard-locale'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.locale.shouldHide
                }
                navItem={CustomStatusNavItem}
                status={localeValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={localeValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <LocaleStep />
              </WizardStep>,
              <WizardStep
                name='Hostname'
                id='wizard-hostname'
                key='wizard-hostname'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.hostname.shouldHide
                }
                navItem={CustomStatusNavItem}
                status={hostnameValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={hostnameValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <HostnameStep />
              </WizardStep>,
              <WizardStep
                name='Kernel'
                id='wizard-kernel'
                key='wizard-kernel'
                navItem={CustomStatusNavItem}
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.kernel.shouldHide
                }
                status={kernelValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={kernelValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <KernelStep />
              </WizardStep>,
              <WizardStep
                name='Firewall'
                id='wizard-firewall'
                key='wizard-firewall'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.firewall.shouldHide
                }
                navItem={CustomStatusNavItem}
                status={firewallValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={firewallValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <FirewallStep />
              </WizardStep>,
              <WizardStep
                name='Systemd services'
                id='wizard-services'
                key='wizard-services'
                // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                isHidden={isImageMode || restrictions.services.shouldHide}
                navItem={CustomStatusNavItem}
                status={servicesValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={servicesValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <ServicesStep />
              </WizardStep>,
              <WizardStep
                name='Ansible Automation Platform'
                id='wizard-aap'
                key='wizard-aap'
                isHidden={
                  // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                  isImageMode || restrictions.aap.shouldHide
                }
                navItem={CustomStatusNavItem}
                status={aapValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={aapValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <AAPStep />
              </WizardStep>,
              <WizardStep
                name='First boot script configuration'
                id='wizard-first-boot'
                key='wizard-first-boot'
                navItem={CustomStatusNavItem}
                status={firstBootValidation.disabledNext ? 'error' : 'default'}
                // TODO: maybe move the isImageMode into the customizationRestrictions query transformation
                isHidden={
                  isOnPremise ||
                  isImageMode ||
                  restrictions.firstBoot.shouldHide
                }
                footer={
                  <CustomWizardFooter
                    disableNext={firstBootValidation.disabledNext}
                    optional={true}
                    isOnPremise={isOnPremise}
                  />
                }
              >
                <FirstBootStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name='Details'
            id='step-details'
            navItem={CustomStatusNavItem}
            status={detailsValidation.disabledNext ? 'error' : 'default'}
            footer={
              <CustomWizardFooter
                disableNext={detailsValidation.disabledNext}
                isOnPremise={isOnPremise}
              />
            }
          >
            <DetailsStep />
          </WizardStep>
          <WizardStep
            name='Review'
            id='step-review'
            footer={<ReviewWizardFooter />}
          >
            <ReviewStep />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};

export default CreateImageWizard;
