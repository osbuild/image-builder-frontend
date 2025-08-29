import { useEffect, useState } from 'react';

import cockpit from 'cockpit';

export const useOnPremOpenSCAPAvailable = () => {
  // this can default to false in the service, since we will only render
  // a loading spinner for on-prem
  const [isLoading, setIsLoading] = useState(true);
  const [packagesAvailable, setPackagesAvailable] = useState(false);

  useEffect(() => {
    const checkPackages = () => {
      cockpit
        .spawn(['rpm', '-qa', 'openscap-scanner', 'scap-security-guide'], {})
        .then((res: string | Uint8Array<ArrayBufferLike>) => {
          if (typeof res === 'string') {
            setPackagesAvailable(
              res.includes('openscap-scanner') &&
                res.includes('scap-security-guide'),
            );
            setIsLoading(false);
          }
        })
        .catch(() => {
          setPackagesAvailable(false);
          setIsLoading(false);
        });
    };

    checkPackages();
  }, []);

  return [packagesAvailable, isLoading];
};
