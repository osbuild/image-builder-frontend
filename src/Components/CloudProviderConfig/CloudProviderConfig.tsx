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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

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

const ConfigError = ({
  onClose,
}: {
  onClose: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <EmptyState
      variant={EmptyStateVariant.xl}
      icon={ExclamationIcon}
      color='#C9190B'
    >
      <Title headingLevel='h4' size='lg'>
        Error
      </Title>
      <EmptyStateBody>
        There was an error reading the `/etc/osbuild-worker/osbuild-worker.toml`
        config file
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant='primary' onClick={onClose}>
            Go back
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

type CloudProviderConfigProps = {
  setShowCloudConfigModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

export const CloudProviderConfig = ({
  setShowCloudConfigModal,
  isOpen,
}: CloudProviderConfigProps) => {
  const dispatch = useAppDispatch();
  const addNotification = useAddNotification();
  const config = useAppSelector(selectAWSConfig);
  const [enabled, setEnabled] = useState<boolean>(true);

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
    [dispatch, setEnabled],
  );

  const onClose = () => {
    setShowCloudConfigModal(false);
  };

  useEffect(() => {
    initAWSConfig(data?.aws);
  }, [data, initAWSConfig]);

  const composeModalContent = () => {
    if (isLoading) {
      return <Skeleton />;
    }

    if (error) {
      return <ConfigError onClose={onClose} />;
    }

    return (
      <AWSConfig
        refetch={refetch}
        reinit={initAWSConfig}
        enabled={enabled}
        setEnabled={setEnabled}
      />
    );
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-label='Configure cloud providers modal'
    >
      <ModalHeader title='Configure cloud providers' />
      <ModalBody>{composeModalContent()}</ModalBody>
      {!error && (
        <ModalFooter>
          <Button
            type='button'
            isDisabled={!isAwsStepValid(config)}
            onClick={async () => {
              try {
                await updateConfig({
                  updateWorkerConfigRequest: { aws: config },
                });
                setShowCloudConfigModal(false);
              } catch {
                addNotification({
                  variant: 'danger',
                  title: 'Cloud provider config update failed',
                });
              }
            }}
          >
            Submit
          </Button>
          <Button variant='link' type='button' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};
