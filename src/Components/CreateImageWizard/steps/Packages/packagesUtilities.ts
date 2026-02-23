import { IBPackageWithRepositoryInfo } from './packagesTypes';

export const getPackageUniqueKey = (
  pkg: IBPackageWithRepositoryInfo,
): string => {
  try {
    if (!pkg.name) {
      return `invalid_${Date.now()}`;
    }
    return `${pkg.name}_${pkg.stream || 'none'}_${pkg.module_name || 'none'}_${pkg.repository || 'unknown'}`;
  } catch {
    return `error_${Date.now()}`;
  }
};
