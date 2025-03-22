import { useEffect, useState } from 'react';

import cockpit from 'cockpit';

export const useOnPremOpenSCAPAvailable = () => {
  const [packagesAvailable, setPackagesAvailable] = useState(false);

  useEffect(() => {
    const checkPackages = async () => {
      try {
        const openSCAPAvailable = await cockpit.spawn(
          ['rpm', '-qa', 'openscap-scanner'],
          {}
        );

        const ssgAvailable = await cockpit.spawn(
          ['rpm', '-qa', 'scap-security-guide'],
          {}
        );

        setPackagesAvailable(openSCAPAvailable !== '' && ssgAvailable !== '');
      } catch {
        // this doesn't change the value,
        // but we need to handle the error
        // so just set the value to false
        setPackagesAvailable(false);
      }
    };

    if (process.env.IS_ON_PREMISE) {
      checkPackages();
    }
  }, []);

  return packagesAvailable;
};
