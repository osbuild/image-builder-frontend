import React, { useEffect, useRef } from 'react';

import {
  Bullseye,
  Content,
  Divider,
  Form,
  Modal,
  Spinner,
  Title,
  Wizard,
  WizardHeader,
  WizardNavItem,
  WizardStep,
  WizardStepType,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useSearchParams } from 'react-router-dom';

import { useGetUser } from '@/Hooks';
import { useGetBlueprintQuery } from '@/store/api/backend';
import { useCustomizationRestrictions } from '@/store/api/distributions/hooks';
import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  addImageType,
  changeArchitecture,
  changeBaseUrl,
  changeDistribution,
  changeProxy,
  changeServerUrl,
  changeTimezone,
  initializeWizard,
  loadWizardState,
  selectDistribution,
  selectImageSource,
  selectImageTypes,
  selectIsImageMode,
  selectTimezone,
} from '@/store/slices/wizard';
import {
  closeWizardModal,
  openWizardModal,
  selectIsWizardModalOpen,
  selectWizardModalMode,
} from '@/store/slices/wizardModal';

import CustomWizardFooter from './components/CustomWizardFooter';
import ReviewWizardFooter from './components/ReviewWizardFooter';

import {
  AARCH64,
  AMPLITUDE_MODULE_NAME,
  CDN_PROD_URL,
  CDN_STAGE_URL,
  DEFAULT_TIMEZONE,
  RHEL_10,
  RHEL_8,
  RHEL_9,
} from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getHostArch, getHostDistro } from '../../Utilities/getHostInfo';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import DetailsStep from '../CreateImageWizard/steps/Details';
import FileSystemStep from '../CreateImageWizard/steps/FileSystem';
import FirewallStep from '../CreateImageWizard/steps/Firewall';
import FirstBootStep from '../CreateImageWizard/steps/FirstBoot';
import HostnameStep from '../CreateImageWizard/steps/Hostname';
import ImageOutputStep from '../CreateImageWizard/steps/ImageOutput';
import KernelStep from '../CreateImageWizard/steps/Kernel';
import LocaleStep from '../CreateImageWizard/steps/Locale';
import OscapStep from '../CreateImageWizard/steps/Oscap';
import PackagesStep from '../CreateImageWizard/steps/Packages';
import RegistrationStep from '../CreateImageWizard/steps/Registration';
import RepositoriesStep from '../CreateImageWizard/steps/Repositories';
import ReviewStep from '../CreateImageWizard/steps/Review';
import ServicesStep from '../CreateImageWizard/steps/Services';
import RepeatableBuildStep from '../CreateImageWizard/steps/Snapshot';
import TimezoneStep from '../CreateImageWizard/steps/Timezone';
import UserGroupsStep from '../CreateImageWizard/steps/UserGroups';
import UsersStep from '../CreateImageWizard/steps/Users';
import { mapRequestToState } from '../CreateImageWizard/utilities/requestMapper';
import {
  useAwsValidation,
  useAzureValidation,
  useDetailsValidation,
  useFilesystemValidation,
  useFirewallValidation,
  useFirstBootValidation,
  useGcpValidation,
  useHostnameValidation,
  useKernelValidation,
  useLocaleValidation,
  useRegistrationValidation,
  useServicesValidation,
  useSnapshotValidation,
  useTimezoneValidation,
  useUserGroupsValidation,
  useUsersValidation,
} from '../CreateImageWizard/utilities/useValidation';

const CreateImageWizard3 = () => {
  const dispatch = useAppDispatch();
  const { isProd } = useGetEnvironment();
  const showWizardModal = useAppSelector(selectIsWizardModalOpen);
  const mode = useAppSelector(selectWizardModalMode);
  const blueprintId = useAppSelector(selectSelectedBlueprintId);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);
  const imageSource = useAppSelector(selectImageSource);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const hasTrackedInitialStepRef = useRef(false);

  const { data: blueprintDetails, isSuccess } = useGetBlueprintQuery(
    { id: blueprintId || '' },
    { skip: !(mode === 'edit' && !!blueprintId) },
  );

  const distribution = useAppSelector(selectDistribution);
  const timezone = useAppSelector(selectTimezone);
  const targetEnvironments = useAppSelector(selectImageTypes);

  // Validation hooks
  const awsValidation = useAwsValidation();
  const gcpValidation = useGcpValidation();
  const azureValidation = useAzureValidation();
  const detailsValidation = useDetailsValidation();
  const registrationValidation = useRegistrationValidation();
  const snapshotValidation = useSnapshotValidation();
  const filesystemValidation = useFilesystemValidation();
  const timezoneValidation = useTimezoneValidation();
  const localeValidation = useLocaleValidation();
  const hostnameValidation = useHostnameValidation();
  const kernelValidation = useKernelValidation();
  const servicesValidation = useServicesValidation();
  const firewallValidation = useFirewallValidation();
  const firstBootValidation = useFirstBootValidation();
  const usersValidation = useUsersValidation();
  const userGroupsValidation = useUserGroupsValidation();

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: targetEnvironments,
  });

  const usersHaveErrors =
    usersValidation.disabledNext || userGroupsValidation.disabledNext;

  const baseSettingsHasErrors =
    targetEnvironments.length === 0 ||
    (isImageMode && !imageSource) ||
    awsValidation.disabledNext ||
    gcpValidation.disabledNext ||
    azureValidation.disabledNext ||
    detailsValidation.disabledNext ||
    registrationValidation.disabledNext ||
    snapshotValidation.disabledNext ||
    (restrictions.users.required && usersHaveErrors);

  const advancedSettingsHasErrors =
    filesystemValidation.disabledNext ||
    timezoneValidation.disabledNext ||
    localeValidation.disabledNext ||
    hostnameValidation.disabledNext ||
    kernelValidation.disabledNext ||
    servicesValidation.disabledNext ||
    firewallValidation.disabledNext ||
    firstBootValidation.disabledNext ||
    (!(restrictions.users.shouldHide || restrictions.users.required) &&
      usersHaveErrors);

  useEffect(() => {
    const hasUrlParams =
      searchParams.has('release') ||
      searchParams.has('target') ||
      searchParams.has('arch');

    if (hasUrlParams && !showWizardModal) {
      dispatch(openWizardModal('create'));
      return;
    }

    if (mode === 'create' && showWizardModal) {
      if (!hasInitialized.current) {
        dispatch(initializeWizard());
        hasInitialized.current = true;
      }

      // Initialize registration URLs
      if (isProd()) {
        dispatch(changeServerUrl('subscription.rhsm.redhat.com'));
        dispatch(changeBaseUrl(CDN_PROD_URL));
        dispatch(changeProxy(undefined));
      } else {
        dispatch(changeServerUrl('subscription.rhsm.stage.redhat.com'));
        dispatch(changeBaseUrl(CDN_STAGE_URL));
        dispatch(changeProxy('squid.corp.redhat.com:3128'));
      }

      // Initialize params
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
    }
    // This useEffect hook should run *only* when the modal opens in create mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, showWizardModal]);

  useEffect(() => {
    if (
      (mode !== 'create' && mode !== 'import') ||
      !isOnPremise ||
      !showWizardModal
    ) {
      return;
    }

    const initializeHostDistro = async () => {
      const distro = await getHostDistro();
      dispatch(changeDistribution(distro));
    };

    const initializeHostArch = async () => {
      const arch = await getHostArch();
      dispatch(changeArchitecture(arch));
    };

    if (!searchParams.get('release')) {
      initializeHostDistro();
    }
    if (!searchParams.get('arch')) {
      initializeHostArch();
    }
    // This useEffect hook should run *only* when the modal opens in import/create mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, showWizardModal]);

  useEffect(() => {
    if (mode === 'edit' && blueprintId && blueprintDetails) {
      const editBlueprintState = mapRequestToState(blueprintDetails);
      dispatch(loadWizardState(editBlueprintState));
    }
  }, [mode, blueprintId, blueprintDetails, dispatch]);

  useEffect(() => {
    if (mode !== 'create') {
      return;
    }

    const defaultTimezone =
      distribution === RHEL_10 || targetEnvironments.includes('azure')
        ? DEFAULT_TIMEZONE
        : 'America/New_York';

    if (!timezone) {
      dispatch(changeTimezone(defaultTimezone));
    }
  }, [distribution, targetEnvironments, mode, dispatch]);

  useEffect(() => {
    if (!isOnPremise && showWizardModal && !hasTrackedInitialStepRef.current) {
      const initialStepId =
        mode === 'edit' ? 'review-step' : 'base-settings-step';
      const accountId = userData?.identity.internal?.account_id;

      analytics.track(`${AMPLITUDE_MODULE_NAME} - Step Viewed`, {
        module: AMPLITUDE_MODULE_NAME,
        step_id: initialStepId,
        ...(accountId && { account_id: accountId }),
        from_step_id: undefined,
      });
      hasTrackedInitialStepRef.current = true;
    }
  }, [showWizardModal, analytics, isOnPremise, mode, userData]);

  const handleStepChange = (
    _event: React.MouseEvent<HTMLButtonElement>,
    currentStep: WizardStepType,
    prevStep: WizardStepType,
  ) => {
    if (!isOnPremise) {
      const accountId = userData?.identity.internal?.account_id;

      analytics.track(`${AMPLITUDE_MODULE_NAME} - Step Viewed`, {
        module: AMPLITUDE_MODULE_NAME,
        step_id: currentStep.id,
        ...(accountId && { account_id: accountId }),
        from_step_id: prevStep.id,
      });
    }
  };

  const handleClose = () => {
    dispatch(closeWizardModal());
    dispatch(initializeWizard());
    hasTrackedInitialStepRef.current = false;

    if (
      searchParams.has('release') ||
      searchParams.has('target') ||
      searchParams.has('arch')
    ) {
      const params = new URLSearchParams(searchParams);
      params.delete('release');
      params.delete('target');
      params.delete('arch');
      setSearchParams(params);
    }
  };

  const CustomStatusNavItem = (
    step: WizardStepType,
    activeStep: WizardStepType,
    _steps: WizardStepType[],
    goToStepByIndex: (index: number) => void,
  ) => {
    const status = (step.id !== activeStep.id && step.status) || 'default';

    const isBaseSettingsStep = step.id === 'base-settings-step';
    const hasVisitedBaseSettings = _steps.find(
      (s) => s.id === 'base-settings-step',
    )?.isVisited;
    const canNavigate =
      mode === 'edit' ||
      step.isVisited ||
      isBaseSettingsStep ||
      (hasVisitedBaseSettings && !baseSettingsHasErrors);

    return (
      <WizardNavItem
        key={step.id}
        id={step.id}
        content={step.name}
        isCurrent={activeStep.id === step.id}
        isDisabled={step.isDisabled || !canNavigate}
        isVisited={step.isVisited || false}
        stepIndex={step.index}
        onClick={() => goToStepByIndex(step.index)}
        status={status}
      />
    );
  };

  const REVIEW_STEP_INDEX = 4;
  const startIndex = mode === 'edit' ? REVIEW_STEP_INDEX : 1;

  if (mode === 'edit' && !isSuccess) {
    return (
      <Modal
        isOpen={showWizardModal}
        aria-label='Loading image wizard'
        onClose={handleClose}
        style={{ height: '90vh', width: '80vw' }}
      >
        <Bullseye>
          <Spinner size='xl' />
        </Bullseye>
      </Modal>
    );
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <Modal
      isOpen={showWizardModal}
      aria-label='Create image wizard'
      onEscapePress={handleClose}
      style={{ height: '90vh', width: '80vw' }}
    >
      <Wizard
        onClose={handleClose}
        onStepChange={handleStepChange}
        isVisitRequired
        startIndex={startIndex}
        header={
          <WizardHeader
            onClose={handleClose}
            title='Build an image'
            description='Create custom system images with your preferred configurations, packages, and settings. Build images for different target environments and deployment scenarios.'
          />
        }
      >
        <WizardStep
          name='Base settings'
          id='base-settings-step'
          navItem={CustomStatusNavItem}
          status={baseSettingsHasErrors ? 'error' : 'default'}
          footer={
            <CustomWizardFooter
              disableBack={true}
              disableNext={baseSettingsHasErrors}
              isOnPremise={isOnPremise}
            />
          }
        >
          <Form>
            <Content>
              <Title headingLevel='h1' size='xl'>
                Base settings
              </Title>
              <Content>
                Your selections below may automatically add required
                configurations in subsequent steps.
              </Content>
            </Content>
            {/* Conditionally render steps with dividers between them */}
            {[
              <DetailsStep key='details' />,
              <ImageOutputStep key='image-output' />,
              !restrictions.registration.shouldHide && (
                <RegistrationStep key='registration' />
              ),
              !restrictions.repositories.shouldHide && (
                <RepeatableBuildStep key='repeatable-build' />
              ),
              !(
                restrictions.openscap.shouldHide && restrictions.fips.shouldHide
              ) && <OscapStep key='oscap' />,
              restrictions.users.required && <UserGroupsStep key='groups' />,
              restrictions.users.required && <UsersStep key='users' />,
            ]
              .filter(Boolean)
              .flatMap((component, index, array) =>
                index < array.length - 1
                  ? [
                      component,
                      <Divider
                        key={`divider-${index}`}
                        className='pf-v6-u-mt-xl'
                      />,
                    ]
                  : [component],
              )}
          </Form>
        </WizardStep>
        <WizardStep
          name='Repositories and packages'
          id='content-step'
          navItem={CustomStatusNavItem}
          status='default'
          isHidden={
            restrictions.repositories.shouldHide &&
            restrictions.packages.shouldHide
          }
          footer={
            <CustomWizardFooter disableNext={false} isOnPremise={isOnPremise} />
          }
        >
          <Form onSubmit={handleFormSubmit}>
            <Content>
              <Title headingLevel='h1' size='xl'>
                Repositories and packages
              </Title>
              <Content>
                Choose the repositories and individual packages to include in
                your image. You can select from standard RHEL repositories or
                add your own custom content. The selections on this page may
                automatically add required configurations in subsequent steps.
              </Content>
            </Content>
            {!restrictions.repositories.shouldHide && <RepositoriesStep />}
            {!restrictions.repositories.shouldHide &&
              !restrictions.packages.shouldHide && <br />}
            {!restrictions.packages.shouldHide && <PackagesStep />}
          </Form>
        </WizardStep>
        <WizardStep
          name='Advanced settings'
          id='advanced-settings-step'
          navItem={CustomStatusNavItem}
          status={advancedSettingsHasErrors ? 'error' : 'default'}
          isHidden={
            restrictions.filesystem.shouldHide &&
            restrictions.timezone.shouldHide &&
            restrictions.locale.shouldHide &&
            restrictions.hostname.shouldHide &&
            restrictions.kernel.shouldHide &&
            restrictions.services.shouldHide &&
            restrictions.firewall.shouldHide &&
            (restrictions.users.shouldHide || restrictions.users.required) &&
            restrictions.firstBoot.shouldHide
          }
          footer={
            <CustomWizardFooter
              disableNext={advancedSettingsHasErrors}
              isOnPremise={isOnPremise}
            />
          }
        >
          <Form onSubmit={handleFormSubmit}>
            <Content>
              <Title headingLevel='h1' size='xl'>
                Advanced settings
              </Title>
              <Content>
                Define additional specifications to fully customize your image.
                Use these settings to manage system identity, infrastructure
                configurations like kernel and file systems, and security rules
                including firewall and user access.
              </Content>
            </Content>
            {/* Conditionally render steps with dividers between them */}
            {[
              !restrictions.filesystem.shouldHide && (
                <FileSystemStep key='filesystem' />
              ),
              !restrictions.timezone.shouldHide && (
                <TimezoneStep key='timezone' />
              ),
              !restrictions.locale.shouldHide && <LocaleStep key='locale' />,
              !restrictions.hostname.shouldHide && (
                <HostnameStep key='hostname' />
              ),
              !restrictions.kernel.shouldHide && <KernelStep key='kernel' />,
              !restrictions.services.shouldHide && (
                <ServicesStep key='services' />
              ),
              !restrictions.firewall.shouldHide && (
                <FirewallStep key='firewall' />
              ),
              !(
                restrictions.users.shouldHide || restrictions.users.required
              ) && <UserGroupsStep key='groups' />,
              !(
                restrictions.users.shouldHide || restrictions.users.required
              ) && <UsersStep key='users' />,
              !restrictions.firstBoot.shouldHide && (
                <FirstBootStep key='firstboot' />
              ),
            ]
              .filter(Boolean)
              .flatMap((component, index, array) =>
                index < array.length - 1
                  ? [
                      component,
                      <Divider
                        key={`divider-${index}`}
                        className='pf-v6-u-mt-xl'
                      />,
                    ]
                  : [component],
              )}
          </Form>
        </WizardStep>
        <WizardStep
          name='Review'
          id='review-step'
          navItem={CustomStatusNavItem}
          status='default'
          footer={<ReviewWizardFooter />}
        >
          <Form>
            <Content>
              <Title headingLevel='h1' size='xl'>
                Review image configuration
              </Title>
              <Content>
                Verify your image specifications and configurations. Review the
                details below to ensure accuracy before you initiate the build.
              </Content>
            </Content>
            <ReviewStep />
          </Form>
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default CreateImageWizard3;
