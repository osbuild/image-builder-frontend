import cockpit from 'cockpit';

import type { RegistryAuthStatus } from '@/store/api/backend/onprem/types';

const getRegistryLogin = async (): Promise<string | null> => {
  try {
    const result = await cockpit.spawn(
      ['podman', 'login', '--get-login', 'registry.redhat.io'],
      { superuser: 'require' },
    );
    return (result as string).trim() || null;
  } catch {
    return null;
  }
};

const verifyRegistryAccess = async (): Promise<boolean> => {
  try {
    await cockpit.spawn(
      ['podman', 'search', 'registry.redhat.io/rhel10', '--limit', '1'],
      { superuser: 'require' },
    );
    return true;
  } catch {
    return false;
  }
};

export const checkRegistryAuth = async (): Promise<RegistryAuthStatus> => {
  const username = await getRegistryLogin();
  if (!username) {
    return { status: 'not-logged-in' };
  }

  const isValid = await verifyRegistryAccess();
  if (!isValid) {
    return { status: 'auth-failed', username };
  }

  return { status: 'authenticated', username };
};
