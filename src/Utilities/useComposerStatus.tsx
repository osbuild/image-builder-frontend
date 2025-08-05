import { useEffect, useState } from 'react';

import cockpit from 'cockpit';

export const useGetComposerSocketStatus = () => {
  const [enabled, setEnabled] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const isEnabled = async () => {
      try {
        const result = await cockpit.spawn(
          ['systemctl', 'is-enabled', 'osbuild-composer.socket'],
          { superuser: 'try' },
        );
        setEnabled((result as string).trim() === 'enabled');
      } catch {
        // error code 1 means disabled
        setEnabled(false);
      }
    };

    const isStarted = async () => {
      try {
        const result = await cockpit.spawn(
          ['systemctl', 'is-active', 'osbuild-composer.socket'],
          { superuser: 'try' },
        );
        setStarted((result as string).trim() === 'active');
      } catch {
        // exit code 3 means not active
        setStarted(false);
      }
    };

    isEnabled();
    isStarted();
  }, []);

  return {
    enabled,
    started,
  };
};
