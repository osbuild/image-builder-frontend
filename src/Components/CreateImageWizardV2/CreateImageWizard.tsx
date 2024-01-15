import React, { useEffect } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import DetailsStep from './steps/Details';
import ImageOutputStep from './steps/ImageOutput';
import OscapStep from './steps/Oscap';
import RegistrationStep from './steps/Registration';
import RepositoriesStep from './steps/Repositories';
import Aws from './steps/TargetEnvironment/Aws';
import Gcp from './steps/TargetEnvironment/Gcp';
import {
  isAwsAccountIdValid,
  isBlueprintDescriptionValid,
  isBlueprintNameValid,
  isGcpEmailValid,
} from './validators';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './CreateImageWizard.scss';
import {
  initializeWizard,
  selectActivationKey,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAwsSource,
  selectBlueprintDescription,
  selectBlueprintName,
  selectGcpEmail,
  selectGcpShareMethod,
  selectImageTypes,
  selectRegistrationType,
} from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

type CustomWizardFooterPropType = {
  disableNext: boolean;
};

export const CustomWizardFooter = ({
  disableNext: disableNext,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button variant="primary" onClick={goToNextStep} isDisabled={disableNext}>
        Next
      </Button>
      <Button variant="secondary" onClick={goToPrevStep}>
        Back
      </Button>
      <Button variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

const CreateImageWizard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // IMPORTANT: Ensure the wizard starts with a fresh initial state
  useEffect(() => {
    dispatch(initializeWizard());
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*           *
   * Selectors *
   *           */

  // Image Output
  const targetEnvironments = useAppSelector((state) => selectImageTypes(state));
  // AWS
  const awsShareMethod = useAppSelector((state) => selectAwsShareMethod(state));
  const awsAccountId = useAppSelector((state) => selectAwsAccountId(state));
  const awsSourceId = useAppSelector((state) => selectAwsSource(state));
  // GCP
  const gcpShareMethod = useAppSelector((state) => selectGcpShareMethod(state));
  const gcpEmail = useAppSelector((state) => selectGcpEmail(state));

  const registrationType = useAppSelector((state) =>
    selectRegistrationType(state)
  );
  const blueprintName = useAppSelector((state) => selectBlueprintName(state));
  const blueprintDescription = useAppSelector((state) =>
    selectBlueprintDescription(state)
  );
  const activationKey = useAppSelector((state) => selectActivationKey(state));

  return (
    <>
      <ImageBuilderHeader />
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <Wizard onClose={() => navigate(resolveRelPath(''))} isVisitRequired>
          <WizardStep
            name="Image output"
            id="step-image-output"
            footer={
              <CustomWizardFooter
                disableNext={targetEnvironments.length === 0}
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
            name="Content"
            id="step-content"
            steps={[
              <WizardStep
                name="Custom repositories"
                id="wizard-custom-repositories"
                key="wizard-custom-repositories"
                footer={<CustomWizardFooter disableNext={false} />}
              >
                <RepositoriesStep />
              </WizardStep>,
            ]}
          ></WizardStep>
          <WizardStep
            name="Details"
            id="step-details"
            footer={
              <CustomWizardFooter
                disableNext={
                  !isBlueprintNameValid(blueprintName) ||
                  !isBlueprintDescriptionValid(blueprintDescription)
                }
              />
            }
          >
            <DetailsStep />
          </WizardStep>
          <WizardStep
            name="Review"
            id="step-review"
            footer={<CustomWizardFooter disableNext={true} />}
          ></WizardStep>
        </Wizard>
      </section>
    </>
  );
};

export default CreateImageWizard;
