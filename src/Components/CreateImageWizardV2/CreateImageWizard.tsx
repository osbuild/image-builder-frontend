import React from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import ImageOutputStep from './steps/ImageOutput';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './CreateImageWizard.scss';
import { initializeWizard, selectImageTypes } from '../../store/wizardSlice';
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
                disableNext={
                  useAppSelector((state) => selectImageTypes(state)).length ===
                  0
                }
              />
            }
          >
            <ImageOutputStep />
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
