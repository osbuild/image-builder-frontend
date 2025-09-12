import { useEffect, useState } from 'react';

import cockpit from 'cockpit';

export const useIsCockpitAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // @ts-expect-error cockpit hasn't created a type for this upstream
    const permission = cockpit.permission({ admin: true });

    const onChangeListener = () => {
      setIsAdmin(permission.allowed);
    };

    permission.addEventListener('changed', onChangeListener);

    // Check the initial state
    onChangeListener();

    return () => {
      permission.removeEventListener('changed', onChangeListener);
    };
  }, []);

  return isAdmin;
};
