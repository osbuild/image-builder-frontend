import { isNonNullObject, OnPremApiError } from '@/store/api/shared';

import { PackagesResponse } from './types';

export const isPackagesResponse = (
  value: unknown,
): value is PackagesResponse => {
  if (!isNonNullObject(value)) {
    return false;
  }

  // `packages` is optional in PackagesResponse, so an object
  // without the field is a valid empty response
  if (!('packages' in value) || value.packages === undefined) {
    return true;
  }

  if (!Array.isArray(value.packages)) {
    return false;
  }

  return value.packages.every(
    (pkg: unknown) =>
      isNonNullObject(pkg) &&
      'name' in pkg &&
      typeof pkg.name === 'string' &&
      'summary' in pkg &&
      typeof pkg.summary === 'string' &&
      'arch' in pkg &&
      typeof pkg.arch === 'string' &&
      'version' in pkg &&
      typeof pkg.version === 'string' &&
      'release' in pkg &&
      typeof pkg.release === 'string',
  );
};

export const assertPackagesResponse = (value: unknown): PackagesResponse => {
  if (!isPackagesResponse(value)) {
    throw new OnPremApiError('Package search returned an unexpected response');
  }
  return value;
};
