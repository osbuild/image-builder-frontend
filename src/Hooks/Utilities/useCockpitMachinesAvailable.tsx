import { useEffect, useState } from 'react';

import cockpit from 'cockpit';

import { selectIsOnPremise } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';

/**
 * Hook to check if cockpit-machines is installed and available.
 * Returns true if the cockpit-machines package is installed, false otherwise.
 * Only checks when running on-premise (in Cockpit).
 */
export const useCockpitMachinesAvailable = (): boolean => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!isOnPremise) {
      setIsAvailable(false);
      return;
    }

    const checkMachinesAvailable = async () => {
      try {
        // Check if cockpit-machines manifest exists
        const manifestPath = '/usr/share/cockpit/machines/manifest.json';
        const file = cockpit.file(manifestPath);
        await file.read();
        setIsAvailable(true);
      } catch {
        // File doesn't exist or can't be read - machines not installed
        setIsAvailable(false);
      }
    };

    checkMachinesAvailable();
  }, [isOnPremise]);

  return isAvailable;
};
