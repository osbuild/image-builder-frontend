import React, { useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Spinner,
  TextInput,
} from '@patternfly/react-core';

import {
  useGetRegistryAuthStatusQuery,
  useRegistryLoginMutation,
  useRegistryLogoutMutation,
} from '@/store/api/backend';
import { OnPremError } from '@/store/api/shared';

const EmptyCard = ({ openForm }: { openForm: (arg0: boolean) => void }) => {
  return (
    <Card variant='secondary' className='pf-v6-u-mt-md pf-v6-u-py-md'>
      <EmptyState titleText='Login to select an image' headingLevel='h4'>
        <EmptyStateBody>
          <Content>Registry images come from registry.redhat.io.</Content>
          <Content>
            Sign in to browse available images for this release.
          </Content>
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button onClick={() => openForm(true)}>Login</Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </Card>
  );
};

const LoginCard = ({ closeForm }: { closeForm: (arg0: boolean) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [registryLogin, loginMutation] = useRegistryLoginMutation();

  const usernameError = hasSubmitted && !username ? 'Username is required' : '';
  const passwordError = hasSubmitted && !password ? 'Password is required' : '';
  const loginError = (loginMutation.error as OnPremError | undefined) ?? null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!loginMutation.isLoading) {
        handleLogin();
      }
    }
  };

  const handleLogin = async () => {
    loginMutation.reset();
    setHasSubmitted(true);
    if (!username || !password) {
      return;
    }
    const result = await registryLogin({ username, password });
    if (!('error' in result)) {
      resetForm();
    }
  };

  const resetForm = () => {
    closeForm(false);
    setUsername('');
    setPassword('');
    setHasSubmitted(false);
    loginMutation.reset();
  };

  return (
    <Card variant='secondary' className='pf-v6-u-mt-md'>
      <CardHeader>
        <CardTitle>Log in to registry.redhat.io</CardTitle>
      </CardHeader>
      <CardBody>
        <Content component={ContentVariants.p}>
          Enter your credentials to load available registry images.
        </Content>
        <FormGroup label='Username' isRequired fieldId='registry-username'>
          <TextInput
            isRequired
            type='text'
            id='registry-username'
            value={username}
            validated={usernameError || loginError ? 'error' : 'default'}
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
                <HelperTextItem variant='error' id='registry-username-error'>
                  {usernameError}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
        <FormGroup
          label='Password'
          isRequired
          fieldId='registry-password'
          className='pf-v6-u-mt-md'
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
                <HelperTextItem variant='error' id='registry-password-error'>
                  {passwordError || loginError?.message}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      </CardBody>
      <CardFooter>
        <Flex gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Button
              variant='primary'
              onClick={handleLogin}
              isDisabled={loginMutation.isLoading}
              isLoading={loginMutation.isLoading}
            >
              Log in
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant='link'
              style={
                // this is needed since the card background is `secondary`
                {
                  '--pf-v6-c-button--m-link--hover--BackgroundColor':
                    'transparent',
                } as React.CSSProperties
              }
              onClick={resetForm}
            >
              Cancel
            </Button>
          </FlexItem>
        </Flex>
      </CardFooter>
    </Card>
  );
};

const RegistryStatus = ({ username }: { username: string }) => {
  const [logout] = useRegistryLogoutMutation();

  return (
    <Flex gap={{ default: 'gapSm' }}>
      <FlexItem>
        <Content className='pf-v6-u-mt-md pf-v6-u-text-color-subtle'>
          Connected to registry.redhat.io &middot; {username}
        </Content>
      </FlexItem>
      <FlexItem>
        <Button variant='link' onClick={() => logout()}>
          Log out
        </Button>
      </FlexItem>
    </Flex>
  );
};

const RegistryAuth = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data, isLoading } = useGetRegistryAuthStatusQuery();

  if (isLoading) {
    return (
      <div className='pf-v6-u-mt-md'>
        <Spinner size='sm' aria-label='Checking registry authentication' />
        <Content>Checking registry authentication...</Content>
      </div>
    );
  }

  if (data && data.status === 'authenticated') {
    return <RegistryStatus username={data.username} />;
  }

  if (!isFormVisible) {
    return <EmptyCard openForm={setIsFormVisible} />;
  }

  return <LoginCard closeForm={setIsFormVisible} />;
};

export default RegistryAuth;
