import React, { useContext } from 'react';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import CustomWizardFooter from './CustomWizardFooter';
import {
  ImageWizardContext,
  useInitializeImageWizardContext,
} from './ImageWizardContext';
import { ValidateImageOutputStep } from './steps/ImageOutput/Environment';
import ImageOutputStep from './steps/ImageOutput/ImageOutput';
import ReviewStep from './steps/Review/ReviewStep';
import AWSTarget, {
  ValidateAWSStep,
} from './steps/TargetEnvironment/AWS/AWSTarget';
import AzureTarget, {
  ValidateAzureStep,
} from './steps/TargetEnvironment/Azure/AzureTarget';
import GCPTarget, {
  ValidateGCPStep,
} from './steps/TargetEnvironment/GCP/GCPTarget';

import './CreateImageWizard.scss';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

const CreateImageWizard = () => {
  return (
    <ImageWizardContext.Provider value={useInitializeImageWizardContext()}>
      <ContextedImageWizard />
    </ImageWizardContext.Provider>
  );
};

const ContextedImageWizard = () => {
  const navigate = useNavigate();
  const isImageOutputStepValid = ValidateImageOutputStep();
  const isAwsStepValid = ValidateAWSStep();
  const isGcpStepValid = ValidateGCPStep();
  const isAzureStepValid = ValidateAzureStep();
  const { environmentState } = useContext(ImageWizardContext);
  const [environment] = environmentState;
  const showTargetEnv =
    (environment.aws.selected && environment.aws.authorized) ||
    (environment.gcp.selected && environment.gcp.authorized) ||
    (environment.azure.selected && environment.azure.authorized);
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
                isNextDisabled={!isImageOutputStepValid}
                isBackDisabled
              />
            }
          >
            <ImageOutputStep />
          </WizardStep>
          <WizardStep
            name="Target environment"
            id="step-target-environment"
            isHidden={!showTargetEnv}
            steps={[
              <WizardStep
                name="Amazon Web Services"
                id="aws-sub-step"
                key="aws-sub-step"
                isHidden={
                  !(environment.aws.selected && environment.aws.authorized)
                }
                footer={<CustomWizardFooter isNextDisabled={!isAwsStepValid} />}
              >
                <AWSTarget />
              </WizardStep>,
              <WizardStep
                name="Google Cloud Platform"
                id="gcp-sub-step"
                key="gcp-sub-step"
                isHidden={
                  !(environment.gcp.selected && environment.gcp.authorized)
                }
                footer={<CustomWizardFooter isNextDisabled={!isGcpStepValid} />}
              >
                <GCPTarget />
              </WizardStep>,
              <WizardStep
                name="Microsoft Azure"
                id="azure-sub-step"
                key="azure-sub-step"
                isHidden={
                  !(environment.azure.selected && environment.azure.authorized)
                }
                footer={
                  <CustomWizardFooter isNextDisabled={!isAzureStepValid} />
                }
              >
                <AzureTarget />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name="Review"
            id="step-review"
            footer={<CustomWizardFooter isNextDisabled={true} />}
          >
            <ReviewStep />
          </WizardStep>
        </Wizard>
      </section>
    </>
  );
};

export default CreateImageWizard;
