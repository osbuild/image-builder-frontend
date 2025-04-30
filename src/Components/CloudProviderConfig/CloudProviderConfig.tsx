import React, { MouseEventHandler, useEffect } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  Title,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

import { AWSConfig } from './AWSConfig';
import { useIsAwsStepValid } from './validators';

import { changeAWSConfig } from '../../store/cloudProviderConfigSlice';
import { useGetWorkerConfigQuery } from '../../store/cockpit/cockpitApi';
import { useAppDispatch } from '../../store/hooks';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

const ConfigError = ({
  onClose,
}: {
  onClose: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <EmptyState variant={EmptyStateVariant.xl}>
      <EmptyStateIcon icon={ExclamationIcon} color="#C9190B" />
      <Title headingLevel="h4" size="lg">
        Error
      </Title>
      <EmptyStateBody>
        There was an error reading the `/etc/osbuild-worker/osbuild-worker.toml`
        config file
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="primary" onClick={onClose}>
            Go back
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export const CloudProviderConfig = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleClose = () => navigate(resolveRelPath(''));

  const { data, error } = useGetWorkerConfigQuery({});
  const isAwsStepValid = useIsAwsStepValid();

  useEffect(() => {
    dispatch(changeAWSConfig(data?.aws));
  }, [data, dispatch]);

  if (error) {
    return <ConfigError onClose={handleClose} />;
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
              isBackDisabled: true,
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
