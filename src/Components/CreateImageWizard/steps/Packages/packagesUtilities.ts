import { Module } from '@/store/api/backend';
import { ApiRepositoryCollectionResponseRead } from '@/store/api/contentSources';
import { IBPackage, IBPackageGroup } from '@/store/slices/wizard';

export const getPackageDescription = (pkg: IBPackage) => {
  const parts = [];

  if (pkg.stream) {
    parts.push(pkg.stream);
  }
  if (pkg.end_date) {
    const retirementDate = new Date(pkg.end_date);
    const formattedDate =
      retirementDate.toLocaleString('en-US', { month: 'short' }) +
      ' ' +
      retirementDate.getFullYear();
    parts.push(formattedDate);
  }
  if (pkg.summary) {
    parts.push(pkg.summary);
  }
  return parts.length === 0 ? '--' : parts.join(', ');
};

export const isSelectDisabled = (
  pkg: IBPackage,
  packages: IBPackage[],
  modules: Module[],
  requiredSet: Set<string>,
) => {
  const isModuleDisabledByPackage =
    pkg.type === 'module' &&
    packages.some(
      (p) => (!p.type || p.type === 'package') && p.name === pkg.module_name,
    );

  const isPackageDisabledByModule =
    (!pkg.type || pkg.type === 'package') &&
    modules.some((module: Module) => module.name === pkg.name);

  const isModuleStreamConflict =
    pkg.type === 'module' &&
    modules.some((module: Module) => module.name === pkg.module_name) &&
    !modules.some((m: Module) => m.stream === pkg.stream);

  const isRequired =
    requiredSet.has(pkg.name) && packages.some((p) => p.name === pkg.name);

  return (
    isModuleDisabledByPackage ||
    isPackageDisabledByModule ||
    isModuleStreamConflict ||
    isRequired
  );
};

export const shouldRemoveEpelRepo = (
  isSuccessEpelRepo: boolean,
  epelRepo: ApiRepositoryCollectionResponseRead | undefined,
  packages: IBPackage[],
  groups: IBPackageGroup[],
  removingType: 'package' | 'group',
) => {
  if (!isSuccessEpelRepo || !epelRepo?.data) {
    return false;
  }

  if (removingType === 'package') {
    return (
      packages.filter((pkg) => pkg.isRecommendedRepository).length === 1 &&
      groups.filter((grp) => grp.isRecommendedRepository).length === 0
    );
  }

  return (
    groups.filter((grp) => grp.isRecommendedRepository).length === 1 &&
    packages.filter((pkg) => pkg.isRecommendedRepository).length === 0
  );
};
