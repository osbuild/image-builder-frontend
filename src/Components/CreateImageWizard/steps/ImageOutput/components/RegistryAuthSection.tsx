import React, { useState } from 'react';

import {
  useGetRegistryAuthStatusQuery,
  useRegistryLoginMutation,
} from '@/store/api/backend';
import { OnPremError } from '@/store/api/shared/types';

import RegistryAuthStatus from './RegistryAuthStatus';
import RegistryLoginModal from './RegistryLoginModal';

const RegistryAuthSection = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const {
    data: registryAuth,
    isFetching: isCheckingAuth,
    isError: isAuthError,
    error: authQueryError,
  } = useGetRegistryAuthStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [registryLogin, { isLoading: isLoggingIn, error: loginMutationError }] =
    useRegistryLoginMutation();

  const authState = isCheckingAuth
    ? ({ status: 'checking' } as const)
    : isAuthError
      ? ({
          status: 'network-error',
          error:
            (authQueryError as OnPremError).message ||
            'Unable to reach registry',
        } as const)
      : (registryAuth ?? ({ status: 'checking' } as const));

  const handleLogin = async (username: string, password: string) => {
    await registryLogin({ username, password }).unwrap();
  };

  return (
    <>
      <RegistryAuthStatus
        authState={authState}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      <RegistryLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        error={
          loginMutationError
            ? (loginMutationError as OnPremError).message || 'Login failed'
            : null
        }
      />
    </>
  );
};

export default RegistryAuthSection;
