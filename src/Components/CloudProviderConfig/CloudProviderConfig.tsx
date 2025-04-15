import React, { useCallback, useEffect } from 'react';

import { PageSection, Wizard, WizardStep } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { AWSConfig } from './AWSConfig';
import { isAwsStepValid } from './validators';

import {
  changeAWSBucketName,
  changeAWSCredsPath,
  reinitializeAWSConfig,
} from '../../store/cloudProviderConfigSlice';
import { useGetWorkerConfigQuery } from '../../store/cockpit/cockpitApi';
import { AWSWorkerConfig } from '../../store/cockpit/types';
import { useAppDispatch } from '../../store/hooks';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const CloudProviderConfig = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleClose = () => navigate(resolveRelPath(''));

  const { data, error } = useGetWorkerConfigQuery({});

  const initAWSConfig = useCallback(
    (config: AWSWorkerConfig | undefined) => {
      if (!config) {
        dispatch(reinitializeAWSConfig());
        return;
      }

      const { bucket, credentials } = config;
      if (bucket && bucket !== '') {
        dispatch(changeAWSBucketName(bucket));
      }

      if (credentials && credentials !== '') {
        dispatch(changeAWSCredsPath(credentials));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    initAWSConfig(data?.aws);
  }, [data, initAWSConfig]);

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
      <ImageBuilderHeader inWizard={true} />
      <PageSection>
        <Wizard onClose={handleClose}>
          <WizardStep
            name="AWS Config"
            id="aws-config"
            footer={{
              nextButtonText: 'Submit',
              isNextDisabled: !isAwsStepValid(config),
              isBackDisabled: true,
            }}
          >
            <AWSConfig />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};
