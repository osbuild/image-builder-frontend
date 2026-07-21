import React, { useState } from 'react';

import {
  Button,
  Content,
  Flex,
  FlexItem,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

import {
  useGetRegistryAuthStatusQuery,
  useRegistryLoginMutation,
} from '@/store/api/backend';
import type { RegistryAuthStatus } from '@/store/api/backend/onprem';
import type { OnPremError } from '@/store/api/shared/types';

const isOnPremError = (e: unknown): e is OnPremError =>
  typeof e === 'object' &&
  e !== null &&
  'message' in e &&
  typeof (e as { message: unknown }).message === 'string';

type AuthState =
  | RegistryAuthStatus
  | { status: 'checking' }
  | { status: 'network-error'; error: string };

const deriveAuthState = (
  isLoading: boolean,
  isError: boolean,
  error: unknown,
  data: RegistryAuthStatus | undefined,
): AuthState => {
  if (isLoading) {
    return { status: 'checking' };
  }
  if (isError) {
    return {
      status: 'network-error',
      error: isOnPremError(error) ? error.message : 'Unable to reach registry',
    };
  }
  return data ?? { status: 'checking' };
};

type RegistryAuthProps = {
  onLoginSuccess: () => void;
};

const RegistryAuth = ({ onLoginSuccess }: RegistryAuthProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    data: registryAuth,
    isLoading,
    isError,
    error: authQueryError,
  } = useGetRegistryAuthStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [
    registryLogin,
    {
      isLoading: isLoginLoading,
      error: loginMutationError,
      reset: resetMutation,
    },
  ] = useRegistryLoginMutation();

  const authState = deriveAuthState(
    isLoading,
    isError,
    authQueryError,
    registryAuth,
  );

  const loginError = loginMutationError
    ? isOnPremError(loginMutationError)
      ? loginMutationError.message
      : 'Login failed'
    : null;

  const usernameError = hasSubmitted && !username ? 'Username is required' : '';
  const passwordError = hasSubmitted && !password ? 'Password is required' : '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isLoginLoading) {
        handleLogin();
      }
    }
  };

  const handleLogin = async () => {
    resetMutation();
    setHasSubmitted(true);
    if (!username || !password) {
      return;
    }
    try {
      await registryLogin({ username, password }).unwrap();
      resetForm();
      onLoginSuccess();
    } catch {
      // Form stays open on error
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setUsername('');
    setPassword('');
    setHasSubmitted(false);
    resetMutation();
  };

  const showLoginAction =
    authState.status === 'not-logged-in' || authState.status === 'auth-failed';

  return (
    <div className='pf-v6-u-mt-md'>
      <StatusDisplay
        authState={authState}
        showLoginAction={showLoginAction && !isFormVisible}
        onLoginClick={() => setIsFormVisible(true)}
      />
      {isFormVisible && (
        <>
          <Flex
            alignItems={{ default: 'alignItemsFlexStart' }}
            gap={{ default: 'gapSm' }}
            className='pf-v6-u-mt-sm'
          >
            <FlexItem>
              <FormGroup
                label='Username'
                isRequired
                fieldId='registry-username'
              >
                <TextInput
                  isRequired
                  type='text'
                  id='registry-username'
                  value={username}
                  validated={usernameError ? 'error' : 'default'}
                  onChange={(_event, value) => setUsername(value)}
                  onKeyDown={handleKeyDown}
                  autoComplete='username'
                  aria-describedby={
                    usernameError ? 'registry-username-error' : undefined
                  }
                />
                {usernameError && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem
                        variant='error'
                        id='registry-username-error'
                      >
                        {usernameError}
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
              </FormGroup>
            </FlexItem>
            <FlexItem>
              <FormGroup
                label='Password'
                isRequired
                fieldId='registry-password'
              >
                <TextInput
                  isRequired
                  type='password'
                  id='registry-password'
                  value={password}
                  validated={passwordError || loginError ? 'error' : 'default'}
                  onChange={(_event, value) => setPassword(value)}
                  onKeyDown={handleKeyDown}
                  autoComplete='current-password'
                  aria-describedby={
                    passwordError || loginError
                      ? 'registry-password-error'
                      : undefined
                  }
                />
                {(passwordError || loginError) && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem
                        variant='error'
                        id='registry-password-error'
                      >
                        {passwordError || loginError}
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
              </FormGroup>
            </FlexItem>
          </Flex>
          <Flex gap={{ default: 'gapSm' }} className='pf-v6-u-mt-sm'>
            <FlexItem>
              <Button
                variant='primary'
                onClick={handleLogin}
                isDisabled={isLoginLoading}
                isLoading={isLoginLoading}
              >
                Log in
              </Button>
            </FlexItem>
            <FlexItem>
              <Button variant='link' onClick={resetForm}>
                Cancel
              </Button>
            </FlexItem>
          </Flex>
        </>
      )}
    </div>
  );
};

type StatusDisplayProps = {
  authState: AuthState;
  showLoginAction: boolean;
  onLoginClick: () => void;
};

const StatusDisplay = ({
  authState,
  showLoginAction,
  onLoginClick,
}: StatusDisplayProps) => {
  switch (authState.status) {
    case 'checking':
      return (
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
      );
    case 'authenticated':
      return (
        <Label
          color='green'
          variant='outline'
          icon={
            <CheckCircleIcon color='var(--pf-t--global--icon--color--status--success--default)' />
          }
        >
          Logged in to registry.redhat.io as {authState.username}
        </Label>
      );
    case 'not-logged-in':
      return (
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
          {showLoginAction && (
            <FlexItem>
              <Button variant='link' onClick={onLoginClick} isInline>
                Log in
              </Button>
            </FlexItem>
          )}
        </Flex>
      );
    case 'auth-failed':
      return (
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
              Authentication failed for {authState.username} — credentials may
              be expired
            </Label>
          </FlexItem>
          {showLoginAction && (
            <FlexItem>
              <Button variant='link' onClick={onLoginClick} isInline>
                Log in
              </Button>
            </FlexItem>
          )}
        </Flex>
      );
    case 'network-error':
      return (
        <Content>Unable to reach registry.redhat.io: {authState.error}</Content>
      );
    default: {
      const _exhaustive: never = authState;
      return _exhaustive;
    }
  }
};

export default RegistryAuth;
