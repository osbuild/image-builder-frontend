import React from 'react';

import {
  Button,
  Content,
  Flex,
  FlexItem,
  Label,
  Spinner,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

import type { RegistryAuthStatus as ApiRegistryAuthStatus } from '@/store/api/backend/onprem';

type RegistryAuthState =
  | ApiRegistryAuthStatus
  | { status: 'checking' }
  | { status: 'network-error'; error: string };

type RegistryAuthStatusProps = {
  authState: RegistryAuthState;
  onLoginClick: () => void;
};

const RegistryAuthStatus = ({
  authState,
  onLoginClick,
}: RegistryAuthStatusProps) => {
  return (
    <div className='pf-v6-u-mb-sm'>
      {authState.status === 'checking' && (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
        >
          <FlexItem>
            <Spinner size='sm' aria-label='Checking registry authentication' />
          </FlexItem>
          <FlexItem>
            <Content>Checking registry authentication...</Content>
          </FlexItem>
        </Flex>
      )}
      {authState.status === 'authenticated' && (
        <Label
          color='green'
          variant='outline'
          icon={
            <CheckCircleIcon color='var(--pf-t--global--icon--color--status--success--default)' />
          }
        >
          Logged in to registry.redhat.io as {authState.username}
        </Label>
      )}
      {authState.status === 'not-logged-in' && (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
        >
          <FlexItem>
            <Label
              color='orange'
              variant='outline'
              icon={
                <ExclamationTriangleIcon color='var(--pf-t--global--icon--color--status--warning--default)' />
              }
            >
              Not logged in to registry.redhat.io
            </Label>
          </FlexItem>
          <FlexItem>
            <Button variant='link' onClick={onLoginClick} isInline>
              Log in
            </Button>
          </FlexItem>
        </Flex>
      )}
      {authState.status === 'auth-failed' && (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
        >
          <FlexItem>
            <Label
              color='orange'
              variant='outline'
              icon={
                <ExclamationTriangleIcon color='var(--pf-t--global--icon--color--status--warning--default)' />
              }
            >
              Authentication failed for {authState.username} - credentials may
              be expired
            </Label>
          </FlexItem>
          <FlexItem>
            <Button variant='link' onClick={onLoginClick} isInline>
              Log in
            </Button>
          </FlexItem>
        </Flex>
      )}
      {authState.status === 'network-error' && (
        <Content>Unable to reach registry.redhat.io: {authState.error}</Content>
      )}
    </div>
  );
};

export default RegistryAuthStatus;
