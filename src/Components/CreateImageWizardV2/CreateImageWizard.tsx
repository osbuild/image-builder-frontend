import React, { useState } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import ImageOutputStep from './steps/ImageOutput/ImageOutput';
import ReviewStep from './steps/Review/ReviewStep';
import { Aws } from './steps/TargetEnvironment/Aws';
import { isAwsAccountIdValid } from './validators';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './CreateImageWizard.scss';
import {
  initializeWizard,
  selectAwsAccountId,
  selectImageTypes,
} from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

type CustomWizardFooterPropType = {
  isNextDisabled: boolean;
};
/**
 * The custom wizard footer is only switching the order of the buttons compared
 * to the default wizard footer from the PF5 library.
 */
export const CustomWizardFooter = ({
  isNextDisabled,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button
        variant="primary"
        onClick={goToNextStep}
        isDisabled={isNextDisabled}
      >
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

  // Ensure the wizard starts with a fresh initial state
  dispatch(initializeWizard);

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
                isNextDisabled={
                  useAppSelector((state) => selectImageTypes(state)).length ===
                  0
                }
              />
            }
          >
            <ImageOutputStep />
          </WizardStep>
          <WizardStep
            name="Target Environment"
            id="step-target-environment"
            steps={[
              <WizardStep
                name="Amazon Web Services"
                id="expand-steps-sub-a"
                key="expand-steps-sub-a"
                footer={
                  <CustomWizardFooter
                    isNextDisabled={
                      !isAwsAccountIdValid(
                        useAppSelector((state) => selectAwsAccountId(state))
                      )
                    }
                  />
                }
              >
                <Aws />
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
