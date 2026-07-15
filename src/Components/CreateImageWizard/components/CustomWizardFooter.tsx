import React from 'react';

import {
  Button,
  Flex,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { flushSync } from 'react-dom';

import { AMPLITUDE_MODULE_NAME } from '@/constants';
import { useAppDispatch } from '@/store/hooks';
import {
  resetForceShowErrors,
  setForceShowErrors,
} from '@/store/slices/wizard';

import { scrollToFirstError } from '../utilities/scrollToFirstError';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  hasErrors: boolean;
  beforeNext?: () => boolean;
  isOnPremise: boolean;
};

export const CustomWizardFooter = ({
  disableBack,
  hasErrors,
  beforeNext,
  isOnPremise,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, goToStepById, close, activeStep } =
    useWizardContext();
  const { analytics } = useChrome();
  const dispatch = useAppDispatch();
  const reviewAndFinishBtnID = 'wizard-review-and-finish-btn';
  const cancelBtnID = 'wizard-cancel-btn';

  const handleNext = () => {
    if (hasErrors) {
      flushSync(() => {
        dispatch(setForceShowErrors());
      });
      scrollToFirstError();
      return;
    }
    if (!beforeNext || beforeNext()) {
      dispatch(resetForceShowErrors());
      goToNextStep();
    }
  };

  const handleReview = () => {
    if (hasErrors) {
      flushSync(() => {
        dispatch(setForceShowErrors());
      });
      scrollToFirstError();
      return;
    }
    if (!beforeNext || beforeNext()) {
      if (!isOnPremise) {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Button Clicked`, {
          module: AMPLITUDE_MODULE_NAME,
          button_id: reviewAndFinishBtnID,
          active_step_id: activeStep.id,
        });
      }
      dispatch(resetForceShowErrors());
      goToStepById('review-step');
    }
  };

  return (
    <WizardFooterWrapper>
      <Flex
        columnGap={{ default: 'columnGapSm' }}
        justifyContent={{ default: 'justifyContentFlexEnd' }}
      >
        <Button
          variant='secondary'
          onClick={() => {
            dispatch(resetForceShowErrors());
            goToPrevStep();
          }}
          isDisabled={disableBack || false}
        >
          Back
        </Button>
        <Button variant='secondary' onClick={handleNext}>
          Next
        </Button>
        <Button variant='primary' onClick={handleReview}>
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
