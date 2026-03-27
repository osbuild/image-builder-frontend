import React, { useEffect } from 'react';

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
  WizardStep,
} from '@patternfly/react-core';

import { useGetBlueprintQuery } from '@/store/api/backend';
import { selectSelectedBlueprintId } from '@/store/slices/blueprint';
import { selectIsOnPremise } from '@/store/slices/env';
import { loadWizardState } from '@/store/slices/wizard';
import {
  closeWizardModal,
  selectIsWizardModalOpen,
  selectWizardModalMode,
} from '@/store/slices/wizardModal';

import CustomWizardFooter from './components/CustomWizardFooter';
import ReviewWizardFooter from './components/ReviewWizardFooter';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
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
import UsersStep from '../CreateImageWizard/steps/UsersAndGroups';
import { mapRequestToState } from '../CreateImageWizard/utilities/requestMapper';
import {
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
} from '../CreateImageWizard/utilities/useValidation';

export const CreateImageWizard3 = () => {
  const dispatch = useAppDispatch();
  const showWizardModal = useAppSelector(selectIsWizardModalOpen);
  const mode = useAppSelector(selectWizardModalMode);
  const blueprintId = useAppSelector(selectSelectedBlueprintId);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const { data: blueprintDetails, isSuccess } = useGetBlueprintQuery(
    { id: blueprintId || '' },
    { skip: !(mode === 'edit' && !!blueprintId) },
  );

  // Validation hooks
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

  useEffect(() => {
    if (mode === 'edit' && blueprintId && blueprintDetails) {
      const editBlueprintState = mapRequestToState(blueprintDetails);
      dispatch(loadWizardState(editBlueprintState));
    }
  }, [mode, blueprintId, blueprintDetails, dispatch]);

  const handleClose = () => {
    dispatch(closeWizardModal());
  };

  const REVIEW_STEP_INDEX = 4;
  const startIndex = mode === 'edit' ? REVIEW_STEP_INDEX : 1;

  if (mode === 'edit' && !isSuccess) {
    return (
      <Modal
        isOpen={showWizardModal}
        aria-label='Loading image wizard'
        onEscapePress={handleClose}
        style={{ height: '90vh', width: '80vw' }}
      >
        <Bullseye>
          <Spinner size='xl' />
        </Bullseye>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={showWizardModal}
      aria-label='Create image wizard'
      onEscapePress={handleClose}
      style={{ height: '90vh', width: '80vw' }}
    >
      <Wizard
        onClose={handleClose}
        title='Create image wizard'
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
          footer={
            <CustomWizardFooter
              disableBack={true}
              disableNext={
                detailsValidation.disabledNext ||
                registrationValidation.disabledNext ||
                snapshotValidation.disabledNext
              }
              isOnPremise={isOnPremise}
            />
          }
        >
          <Form>
            <Title headingLevel='h1' size='xl'>
              Basic image settings
            </Title>
            <Content>
              Your selections below may automatically add required
              configurations in subsequent steps.
            </Content>
            <DetailsStep />
            <Divider />
            <ImageOutputStep />
            <Divider />
            <RegistrationStep />
            <Divider />
            <RepeatableBuildStep />
            <Divider />
            <OscapStep />
          </Form>
        </WizardStep>
        <WizardStep
          name='Repositories and packages'
          id='content-step'
          footer={
            <CustomWizardFooter disableNext={false} isOnPremise={isOnPremise} />
          }
        >
          <Form>
            <Title headingLevel='h1' size='xl'>
              Repositories and packages
            </Title>
            <Content>
              Choose the repositories and individual packages to include in your
              image. You can select from standard RHEL repositories or add your
              own custom content. The selections on this page may automatically
              add required configurations in subsequent steps.
            </Content>
            <RepositoriesStep />
            <Divider />
            <PackagesStep />
          </Form>
        </WizardStep>
        <WizardStep
          name='Advanced settings'
          id='advance-settings-step'
          footer={
            <CustomWizardFooter
              disableNext={
                filesystemValidation.disabledNext ||
                timezoneValidation.disabledNext ||
                localeValidation.disabledNext ||
                hostnameValidation.disabledNext ||
                kernelValidation.disabledNext ||
                servicesValidation.disabledNext ||
                firewallValidation.disabledNext ||
                firstBootValidation.disabledNext
              }
              isOnPremise={isOnPremise}
            />
          }
        >
          <Form>
            <Title headingLevel='h1' size='xl'>
              Advanced settings
            </Title>
            <Content>
              Define additional specifications to fully customize your image.
              Use these settings to manage system identity, infrastructure
              configurations like kernel and file systems, and security rules
              including firewall and user access.
            </Content>
            <FileSystemStep />
            <Divider />
            <TimezoneStep />
            <Divider />
            <LocaleStep />
            <Divider />
            <HostnameStep />
            <Divider />
            <KernelStep />
            <Divider />
            <ServicesStep />
            <Divider />
            <FirewallStep />
            <Divider />
            <UsersStep />
            <Divider />
            <FirstBootStep />
          </Form>
        </WizardStep>
        <WizardStep
          name='Review'
          id='review-step'
          footer={<ReviewWizardFooter />}
        >
          <Form>
            <Title headingLevel='h1' size='xl'>
              Review image configuration
            </Title>
            <Content>
              Verify your image specifications and configurations. Review the
              details below to ensure accuracy before you initiate the build.
            </Content>
            <ReviewStep />
          </Form>
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default CreateImageWizard3;
