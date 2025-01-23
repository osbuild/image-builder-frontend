import { read_os_release } from 'os-release';

import { Distributions } from '../../../store/imageBuilderApi';

export const getHostDistro = async () => {
  const osRel = await read_os_release();
  return `${osRel.ID}-${osRel.VERSION_ID}` as Distributions;
};
