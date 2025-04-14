import React from 'react';

import { PageSection, Wizard, WizardStep } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { AWSConfig } from './AWSConfig';

import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const CloudProviderConfig = () => {
  const navigate = useNavigate();
  const handleClose = () => navigate(resolveRelPath(''));

  // TODO: add custom wizard footer
  return (
    <>
      <ImageBuilderHeader inWizard={true} />
      <PageSection>
        <Wizard onClose={handleClose}>
          <WizardStep name="AWS Config" id="aws-config">
            <AWSConfig />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};
