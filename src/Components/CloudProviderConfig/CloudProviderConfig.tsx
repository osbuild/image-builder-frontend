import React from 'react';

import { PageSection, Wizard, WizardStep } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { AWSConfig } from './AWSConfig';
import { useIsAwsStepValid } from './validators';

import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const CloudProviderConfig = () => {
  const navigate = useNavigate();
  const handleClose = () => navigate(resolveRelPath(''));

  const isAwsStepValid = useIsAwsStepValid();

  return (
    <>
      <ImageBuilderHeader />
      <PageSection>
        <Wizard onClose={handleClose}>
          <WizardStep
            name="AWS Config"
            id="aws-config"
            footer={{
              nextButtonText: 'Submit',
              isNextDisabled: !isAwsStepValid,
              isBackDisabled: false,
              onBack: () => navigate(resolveRelPath('')),
            }}
          >
            <AWSConfig />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};
