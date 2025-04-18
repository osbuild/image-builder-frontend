import React, { useEffect } from 'react';

import { PageSection, Wizard, WizardStep } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { AWSConfig } from './AWSConfig';
import { useIsAwsStepValid } from './validators';

import { changeAWSConfig } from '../../store/cloudProviderConfigSlice';
import { useGetWorkerConfigQuery } from '../../store/cockpit/cockpitApi';
import { useAppDispatch } from '../../store/hooks';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const CloudProviderConfig = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleClose = () => navigate(resolveRelPath(''));

  const { data, error, refetch } = useGetWorkerConfigQuery({});
  const isAwsStepValid = useIsAwsStepValid();

  useEffect(() => {
    dispatch(changeAWSConfig(data?.aws));
  }, [data, dispatch]);

  if (error) {
    // TODO: improve error alert
    return (
      <div>
        There was an error reading the `/etc/osbuild-worker/osbuild-worker.toml`
        config file
      </div>
    );
  }

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
            <AWSConfig refetch={refetch} />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};
