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
import { WIZARD_STEP_IDS } from '../utilities/useValidation';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  disableNext?: boolean;
  hasErrors: boolean;
  isPending?: boolean;
  beforeNext?: () => boolean;
  isOnPremise: boolean;
};

export const CustomWizardFooter = ({
  disableBack,
  disableNext = false,
  hasErrors,
  isPending,
  beforeNext,
  isOnPremise,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, goToStepById, close, activeStep } =
    useWizardContext();
  const { analytics } = useChrome();
  const dispatch = useAppDispatch();
  const reviewAndFinishBtnID = 'wizard-review-and-finish-btn';
  const cancelBtnID = 'wizard-cancel-btn';

  // While a check is still running there is no error to show, so clicking would
  // do nothing at all. Disable instead: an enabled button that silently
  // discards the click is indistinguishable from a broken page, both to a user
  // and to anything automating one. Real errors keep their enabled button so
  // that clicking still reveals them.
  const isWaitingOnValidation = !!isPending && !hasErrors;

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
      goToStepById(WIZARD_STEP_IDS.REVIEW);
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
        <Button
          variant='secondary'
          onClick={handleNext}
          isDisabled={disableNext || isWaitingOnValidation}
        >
          Next
        </Button>
        <Button
          variant='primary'
          onClick={handleReview}
          isDisabled={disableNext || isWaitingOnValidation}
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
