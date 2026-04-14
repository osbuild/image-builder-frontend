import React from 'react';

import {
  Button,
  Flex,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '@/constants';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  disableNext: boolean;
  beforeNext?: () => boolean;
  isOnPremise: boolean;
};

export const CustomWizardFooter = ({
  disableBack,
  disableNext,
  beforeNext,
  isOnPremise,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, goToStepById, close, activeStep } =
    useWizardContext();
  const { analytics } = useChrome();
  const reviewAndFinishBtnID = 'wizard-review-and-finish-btn';
  const cancelBtnID = 'wizard-cancel-btn';

  return (
    <WizardFooterWrapper>
      <Flex
        columnGap={{ default: 'columnGapSm' }}
        justifyContent={{ default: 'justifyContentFlexEnd' }}
      >
        <Button
          variant='secondary'
          onClick={() => {
            goToPrevStep();
          }}
          isDisabled={disableBack || false}
        >
          Back
        </Button>
        <Button
          variant='secondary'
          onClick={() => {
            if (!beforeNext || beforeNext()) goToNextStep();
          }}
          isDisabled={disableNext}
        >
          Next
        </Button>
        <Button
          variant='primary'
          onClick={() => {
            if (!isOnPremise) {
              analytics.track(`${AMPLITUDE_MODULE_NAME} - Button Clicked`, {
                module: AMPLITUDE_MODULE_NAME,
                button_id: reviewAndFinishBtnID,
                active_step_id: activeStep.id,
              });
            }
            if (!beforeNext || beforeNext()) goToStepById('review-step');
          }}
          isDisabled={disableNext}
        >
          Review image
        </Button>
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

export default CustomWizardFooter;
