import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  PageSection,
  Skeleton,
  Title,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

import { AWSConfig } from './AWSConfig';
import { isAwsStepValid } from './validators';

import {
  changeAWSBucketName,
  changeAWSCredsPath,
  reinitializeAWSConfig,
  selectAWSConfig,
} from '../../store/cloudProviderConfigSlice';
import {
  useGetWorkerConfigQuery,
  useUpdateWorkerConfigMutation,
} from '../../store/cockpit/cockpitApi';
import { AWSWorkerConfig } from '../../store/cockpit/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

const ConfigError = ({
  onClose,
}: {
  onClose: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <EmptyState
      variant={EmptyStateVariant.xl}
      icon={ExclamationIcon}
      color="#C9190B"
    >
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
  const config = useAppSelector(selectAWSConfig);
  const handleClose = () => navigate(resolveRelPath(''));
  const [enabled, setEnabled] = useState<boolean>(false);

  const [updateConfig] = useUpdateWorkerConfigMutation();
  const { data, error, refetch, isLoading } = useGetWorkerConfigQuery({});

  const initAWSConfig = useCallback(
    (config: AWSWorkerConfig | undefined) => {
      if (!config) {
        dispatch(reinitializeAWSConfig());
        setEnabled(false);
        return;
      }

      setEnabled(true);

      const { bucket, credentials } = config;
      if (bucket && bucket !== '') {
        dispatch(changeAWSBucketName(bucket));
      }

      if (credentials && credentials !== '') {
        dispatch(changeAWSCredsPath(credentials));
      }
    },
    [dispatch, setEnabled]
  );

  useEffect(() => {
    initAWSConfig(data?.aws);
  }, [data, initAWSConfig]);

  if (isLoading) {
    return <Skeleton />;
  }

  if (error) {
    return <ConfigError onClose={handleClose} />;
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
              onNext: () => {
                updateConfig({
                  updateWorkerConfigRequest: { aws: config },
                });
                navigate(resolveRelPath(''));
              },
            }}
          >
            <AWSConfig
              refetch={refetch}
              reinit={initAWSConfig}
              enabled={enabled}
              setEnabled={setEnabled}
            />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};
