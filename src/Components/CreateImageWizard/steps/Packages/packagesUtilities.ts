import { ContentOrigin, EPEL_10_REPO_DEFINITION } from '@/constants';
import { Module } from '@/store/api/backend';
import {
  ApiRepositoryCollectionResponseRead,
  useListRepositoriesQuery,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepositoriesById,
  selectDistribution,
  selectPackageGroups,
  selectPackages,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';

export const getPackageDescription = (pkg: IBPackageWithRepositoryInfo) => {
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
  pkg: IBPackageWithRepositoryInfo,
  packages: IBPackageWithRepositoryInfo[],
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
  packages: IBPackageWithRepositoryInfo[],
  groups: GroupWithRepositoryInfo[],
  removingType: 'package' | 'group',
) => {
  if (!isSuccessEpelRepo || !epelRepo?.data) {
    return false;
  }

  if (removingType === 'package') {
    return (
      packages.filter((pkg) => pkg.repository === 'recommended').length === 1 &&
      groups.filter((grp) => grp.repository === 'recommended').length === 0
    );
  }

  return (
    groups.filter((grp) => grp.repository === 'recommended').length === 1 &&
    packages.filter((pkg) => pkg.repository === 'recommended').length === 0
  );
};

export const useEpelRepo = () => {
  const distribution = useAppSelector(selectDistribution);
  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  return useListRepositoriesQuery({
    url: epelRepoUrlByDistribution,
    origin: ContentOrigin.COMMUNITY,
  });
};

export const useRemovePackageContent = () => {
  const dispatch = useAppDispatch();
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const { data: epelRepo, isSuccess: isSuccessEpelRepo } = useEpelRepo();

  const handleRemovePackage = (pkg: IBPackageWithRepositoryInfo) => {
    dispatch(removePackage(pkg.name));
    if (pkg.type === 'module' && pkg.module_name) {
      dispatch(removeModule(pkg.module_name));
    }
    if (
      shouldRemoveEpelRepo(
        isSuccessEpelRepo,
        epelRepo,
        packages,
        groups,
        'package',
      )
    ) {
      dispatch(removeRecommendedRepositoriesById([epelRepo!.data![0].uuid!]));
    }
  };

  const handleRemoveGroup = (grp: GroupWithRepositoryInfo) => {
    dispatch(removePackageGroup(grp.name));
    if (
      shouldRemoveEpelRepo(
        isSuccessEpelRepo,
        epelRepo,
        packages,
        groups,
        'group',
      )
    ) {
      dispatch(removeRecommendedRepositoriesById([epelRepo!.data![0].uuid!]));
    }
  };

  return { handleRemovePackage, handleRemoveGroup };
};
