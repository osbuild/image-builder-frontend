import cockpit from 'cockpit';
import { read_os_release } from 'os-release';

import { AARCH64, X86_64 } from '../constants';
import { Distributions } from '../store/imageBuilderApi';
import { asDistribution } from '../store/typeGuards';

type Architecture = 'x86_64' | 'aarch64';

// Module-level cache for promises - ensures only one request is made
// even if multiple callers invoke concurrently
let cachedHostDistro: Promise<Distributions> | null = null;
let cachedHostArch: Promise<Architecture> | null = null;

export const getHostDistro = async (): Promise<Distributions> => {
  if (!cachedHostDistro) {
    cachedHostDistro = (async () => {
      try {
        const osRel = await read_os_release();
        let distro = `${osRel.ID}-${osRel.VERSION_ID}`;
        // use major releases, and rely on composer's distro aliasing (rhel)
        if (distro.indexOf('.') !== -1) {
          distro = distro.split('.')[0];
        }
        return asDistribution(distro as Distributions);
      } catch (err) {
        cachedHostDistro = null;
        throw err;
      }
    })();
  }
  return cachedHostDistro;
};

export const getHostArch = async (): Promise<Architecture> => {
  if (!cachedHostArch) {
    cachedHostArch = (async () => {
      try {
        const hostArch = await cockpit.spawn(['uname', '-m'], {
          superuser: 'try',
        });
        const arch = (hostArch as string).trim() as Architecture;
        if (![X86_64, AARCH64].includes(arch)) {
          throw new Error(`Unsupported architecture: ${arch}`);
        }
        return arch;
      } catch (err) {
        cachedHostArch = null;
        throw err;
      }
    })();
  }
  return cachedHostArch;
};
