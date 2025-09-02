import { Units } from './fscTypes';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../../constants';

export const normalizeSuffix = (rawSuffix: string) => {
  const suffix = rawSuffix.replace(/^\/+/g, '');
  return suffix.length > 0 ? '/' + suffix : '';
};

export const getPrefix = (mountpoint: string) => {
  return mountpoint.split('/')[1] ? '/' + mountpoint.split('/')[1] : '/';
};

export const getSuffix = (mountpoint: string) => {
  const prefix = getPrefix(mountpoint);
  return normalizeSuffix(mountpoint.substring(prefix.length));
};

export const getConversionFactor = (units: Units) => {
  switch (units) {
    case 'B':
      return 1;
    case 'KiB':
      return UNIT_KIB;
    case 'MiB':
      return UNIT_MIB;
    case 'GiB':
      return UNIT_GIB;
  }
};
