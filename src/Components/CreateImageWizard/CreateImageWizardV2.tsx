import React, { useEffect } from 'react';

import {
  Button,
  Content,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import BaseSettingsStep from './steps/BaseSettings';
import {
  useAwsValidation,
  useAzureValidation,
  useDetailsValidation,
  useGcpValidation,
} from './utilities/useValidation';

import { selectPathResolver } from '../../store/envSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  initializeWizard,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectImageTypes,
} from '../../store/wizardSlice';

type V2WizardFooterProps = {
  disabledNext?: boolean;
};

const V2WizardFooter = ({ disabledNext = false }: V2WizardFooterProps) => {
  const { goToNextStep, goToStepById, close } = useWizardContext();

  return (
    <WizardFooterWrapper>
      <Flex columnGap={{ default: 'columnGapSm' }}>
        <Button
          variant='primary'
          onClick={() => goToNextStep()}
          isDisabled={disabledNext}
        >
          Next
        </Button>
        <Button
          variant='tertiary'
          onClick={() => goToStepById('step-v2-review')}
          isDisabled={disabledNext}
        >
          Review image
        </Button>
        <Button variant='link' onClick={() => close()}>
          Cancel
        </Button>
      </Flex>
    </WizardFooterWrapper>
  );
};

const BaseSettingsFooter = () => {
  const { disabledNext: detailsDisabled } = useDetailsValidation();
  const { disabledNext: registrationDisabled } = useRegistrationValidation();
  const { disabledNext: snapshotDisabled } = useSnapshotValidation();
  const imageTypes = useAppSelector(selectImageTypes);
  const noTargetsSelected = imageTypes.length === 0;
  const { disabledNext: awsDisabled } = useAwsValidation();
  const { disabledNext: gcpDisabled } = useGcpValidation();
  const { disabledNext: azureDisabled } = useAzureValidation();
  const hasAws = imageTypes.includes('aws');
  const hasGcp = imageTypes.includes('gcp');
  const hasAzure = imageTypes.includes('azure');
  // Azure validators (isAzureTenantGUIDValid, etc.) treat undefined as valid
  // because V1's multi-step wizard needs pristine fields to not block other
  // steps. In V2, all cloud configs are inline on one page, so we add explicit
  // presence checks. Modifying the validators would break V1.
  const azureTenantId = useAppSelector(selectAzureTenantId);
  const azureSubscriptionId = useAppSelector(selectAzureSubscriptionId);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const azureIncomplete =
    hasAzure && (!azureTenantId || !azureSubscriptionId || !azureResourceGroup);
  return (
    <V2WizardFooter
      disabledNext={
        detailsDisabled ||
        registrationDisabled ||
        snapshotDisabled ||
        noTargetsSelected ||
        (hasAws && awsDisabled) ||
        (hasGcp && gcpDisabled) ||
        (hasAzure && azureDisabled) ||
        azureIncomplete
      }
    />
  );
};

const CreateImageWizardV2 = () => {
  const dispatch = useAppDispatch();
  const resolvePath = useAppSelector(selectPathResolver);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(initializeWizard());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    navigate(resolvePath(''));
  };

  return (
    <Modal isOpen variant={ModalVariant.large} onClose={handleClose}>
      <ModalHeader
        title='Build an image'
        description='Create a custom system image ready for deployment.'
      />
      <ModalBody>
        <Wizard onClose={handleClose}>
          <WizardStep
            name='Base settings'
            id='step-v2-base-settings'
            footer={<BaseSettingsFooter />}
          >
            <BaseSettingsStep />
          </WizardStep>
          <WizardStep
            name='Repositories and packages'
            id='step-v2-repos'
            footer={<V2WizardFooter />}
          >
            <Content>
              <p>Repositories and packages content coming soon.</p>
            </Content>
          </WizardStep>
          <WizardStep
            name='Advanced settings'
            id='step-v2-advanced'
            footer={<V2WizardFooter />}
          >
            <Content>
              <p>Advanced settings content coming soon.</p>
            </Content>
          </WizardStep>
          <WizardStep
            name='Review'
            id='step-v2-review'
            footer={<V2WizardFooter />}
          >
            <Content>
              <p>Review content coming soon.</p>
            </Content>
          </WizardStep>
        </Wizard>
      </ModalBody>
    </Modal>
  );
};

export default CreateImageWizardV2;
