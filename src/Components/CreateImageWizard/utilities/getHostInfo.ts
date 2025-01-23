import cockpit from 'cockpit';
import { read_os_release } from 'os-release';

import { Distributions } from '../../../store/imageBuilderApi';

export const getHostDistro = async () => {
  const osRel = await read_os_release();
  return `${osRel.ID}-${osRel.VERSION_ID}` as Distributions;
};

type Architecture = 'x86_64' | 'aarch64';
export const getHostArch = async () => {
  const hostArch = await cockpit.spawn(['uname', '-m'], {
    superuser: 'try',
  });

  return (hostArch as string).trim() as Architecture;
};
