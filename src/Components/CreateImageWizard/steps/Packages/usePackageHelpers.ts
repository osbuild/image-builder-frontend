import { useMemo } from 'react';

import { ContentOrigin, EPEL_10_REPO_DEFINITION } from '@/constants';
import { useSecuritySummary } from '@/store/api/backend';
import { useListRepositoriesQuery } from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  IBPackage,
  IBPackageGroup,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepositoriesById,
  selectDistribution,
  selectPackageGroups,
  selectPackages,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';

import { shouldRemoveEpelRepo } from './packagesUtilities';

export const useRequiredPackages = () => {
  const { packages: requiredPackages } = useSecuritySummary();
  return useMemo(() => new Set(requiredPackages), [requiredPackages]);
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

  const handleRemovePackage = (pkg: IBPackage) => {
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

  const handleRemoveGroup = (grp: IBPackageGroup) => {
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
