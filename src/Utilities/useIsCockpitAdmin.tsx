import { useEffect, useState } from 'react';

import cockpit from 'cockpit';

export const useIsCockpitAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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
