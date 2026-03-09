import type { Package } from './types';

import type { SearchRpmApiResponse } from '../hosted/contentSourcesApi';

export type MappedPackage = {
  package_name: string;
  summary: string;
};

// On-prem packages don't include version info in separate fields in the search
// results, so we append it to the summary for user visibility. This differs from
// the hosted experience where version info is displayed separately.
export const mapPackageToSearchResult = (pkg: Package): MappedPackage => ({
  package_name: pkg.name,
  summary: pkg.summary
    ? `${pkg.summary} (${pkg.version}-${pkg.release}.${pkg.arch})`
    : `Version ${pkg.version}-${pkg.release}.${pkg.arch}`,
});

export const deduplicatePackages = (
  packages: readonly MappedPackage[],
): MappedPackage[] => {
  const seen = new Set<string>();
  return packages.filter((pkg) => {
    if (seen.has(pkg.package_name)) {
      return false;
    }
    seen.add(pkg.package_name);
    return true;
  });
};

export const transformPackageResponse = (
  packages: readonly Package[] | undefined,
): SearchRpmApiResponse => {
  if (!packages || packages.length === 0) {
    return [];
  }

  const mapped = packages.map(mapPackageToSearchResult);
  return deduplicatePackages(mapped);
};
