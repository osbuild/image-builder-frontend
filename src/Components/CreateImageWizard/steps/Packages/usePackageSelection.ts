import React, { useMemo, useState } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '@/constants';
import { Module, RecommendationsResponse } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  addModule,
  addPackage,
  addPackageGroup,
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  selectDistribution,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectRecommendedRepositories,
} from '@/store/slices/wizard';

import {
  isSelectDisabled,
  useEpelRepo,
  useRemovePackageContent,
  useRequiredPackages,
} from './packagesUtilities';

type UsePackageSelectionArgs = {
  packageType: 'packages' | 'groups';
  sortedPackages: IBPackageWithRepositoryInfo[];
  transformedGroups: GroupWithRepositoryInfo[];
  recommendationsData: RecommendationsResponse | undefined;
  setActiveStream: (value: string) => void;
};

export const usePackageSelection = ({
  packageType,
  sortedPackages,
  transformedGroups,
  recommendationsData,
  setActiveStream,
}: UsePackageSelectionArgs) => {
  const dispatch = useAppDispatch();
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const modules = useAppSelector(selectModules);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const [pendingRepoRec, setPendingRepoRec] = useState<
    IBPackageWithRepositoryInfo | GroupWithRepositoryInfo | undefined
  >();

  const { isSuccess: isSuccessEpelRepo } = useEpelRepo();
  const { handleRemovePackage, handleRemoveGroup } = useRemovePackageContent();
  const requiredSet = useRequiredPackages();

  const isRequiredAndSelected = (pkg: IBPackageWithRepositoryInfo) =>
    requiredSet.has(pkg.name) && packages.some((p) => p.name === pkg.name);

  const isPackageSelectDisabled = (pkg: IBPackageWithRepositoryInfo) =>
    isSelectDisabled(pkg, packages, modules, requiredSet);

  const selectedPackageKeys = useMemo(
    () => packages.map((p) => `${p.name}|||${p.stream || ''}`),
    [packages],
  );
  const selectedGroupNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (!value || typeof value !== 'string') return;

    if (packageType === 'packages') {
      const [name, stream] = value.split('|||');
      const pkg = sortedPackages.find(
        (p) => p.name === name && (p.stream || '') === stream,
      );
      if (!pkg) return;

      let isSelected = false;

      if (!pkg.type || pkg.type === 'package') {
        const isModuleWithSameName = modules.some(
          (module: Module) => module.name === pkg.name,
        );
        isSelected =
          packages.some(
            (p) => p.name === pkg.name && p.stream === pkg.stream,
          ) && !isModuleWithSameName;
      }

      if (pkg.type === 'module') {
        isSelected =
          packages.some(
            (p) => p.name === pkg.name && p.stream === pkg.stream,
          ) &&
          modules.some(
            (m: Module) =>
              m.name === pkg.module_name && m.stream === pkg.stream,
          );
      }

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          pkg.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setPendingRepoRec(pkg);
        } else {
          dispatch(addPackage(pkg));
          if (pkg.isRecommendation && !isOnPremise) {
            analytics.track(
              `${AMPLITUDE_MODULE_NAME} - Recommended Package Added`,
              {
                module: AMPLITUDE_MODULE_NAME,
                isPreview: isBeta(),
                packageName: pkg.name,
                selectedPackages: packages.map((p) => p.name),
                shownRecommendations: recommendationsData?.packages || [],
                distribution: distribution.replace('-', ''),
                modelVersion: recommendationsData?.modelVersion,
              },
            );
          }
          if (pkg.type === 'module') {
            setActiveStream(pkg.stream || '');
            dispatch(
              addModule({
                name: pkg.module_name || '',
                stream: pkg.stream || '',
              }),
            );
          }
        }
      } else if (!isRequiredAndSelected(pkg)) {
        handleRemovePackage(pkg);
      }
    } else {
      const grp = transformedGroups.find((g) => g.name === value);
      if (!grp) return;

      const isSelected = groups.some((g) => g.name === grp.name);

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          grp.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setPendingRepoRec(grp);
        } else {
          dispatch(addPackageGroup(grp));
        }
      } else {
        handleRemoveGroup(grp);
      }
    }
  };

  return {
    onSelect,
    isPackageSelectDisabled,
    pendingRepoRec,
    setPendingRepoRec,
    selectedPackageKeys,
    selectedGroupNames,
  };
};
