import React, { useContext, useEffect, useState } from 'react';

import {
  Button,
  WizardFooterWrapper,
  useWizardContext,
} from '@patternfly/react-core';
type CustomWizardFooterPropType = {
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
};

/**
 * The custom wizard footer is only switching the order of the buttons compared
 * to the default wizard footer from the PF5 library.
 */
const CustomWizardFooter = ({
  isNextDisabled = false,
  isBackDisabled = false,
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
      <Button
        variant="secondary"
        onClick={goToPrevStep}
        isDisabled={isBackDisabled}
      >
        Back
      </Button>
      <Button variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

export default CustomWizardFooter;
