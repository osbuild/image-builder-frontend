import { useEffect } from 'react';

import { useSearchRepositoryModuleStreamsMutation } from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPackage,
  selectModules,
  selectPackages,
  selectWizardMode,
} from '@/store/slices/wizard';

export const useRestoreModuleInEdit = (
  distroUrls: string[],
  isSuccessDistroRepositories: boolean,
  epelRepoUrlByDistribution: string,
) => {
  const dispatch = useAppDispatch();

  const wizardMode = useAppSelector(selectWizardMode);
  const modules = useAppSelector(selectModules);
  const packages = useAppSelector(selectPackages);

  const [
    searchModulesInfo,
    { data: dataModulesInfo, isSuccess: isSuccessModulesInfo },
  ] = useSearchRepositoryModuleStreamsMutation();

  useEffect(() => {
    if (
      wizardMode !== 'create' &&
      isSuccessDistroRepositories &&
      modules.length > 0
    ) {
      searchModulesInfo({
        apiSearchModuleStreamsRequest: {
          rpm_names: modules.map((module) => module.name),
          urls: [...distroUrls, epelRepoUrlByDistribution],
          uuids: [],
        },
      });
    }
    // searchModulesInfo is an unstable RTK Query mutation trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSuccessDistroRepositories,
    modules,
    distroUrls,
    wizardMode,
    epelRepoUrlByDistribution,
  ]);

  useEffect(() => {
    if (!isSuccessModulesInfo) return;

    dataModulesInfo.forEach((module) => {
      const moduleName = module.module_name;
      if (!moduleName) return;

      const enabledModule = modules.find((m) => m.name === moduleName);
      if (!enabledModule) return;

      const matchingStream = module.streams?.find(
        (stream) => stream.stream === enabledModule.stream,
      );

      matchingStream?.package_names?.forEach((packageName) => {
        const existingPackage = packages.find(
          (pkg) => pkg.name === packageName,
        );
        if (!existingPackage) return;

        dispatch(
          addPackage({
            ...existingPackage,
            type: 'module',
            module_name: moduleName,
            stream: enabledModule.stream,
          }),
        );
      });
    });
    // packages is excluded to avoid an infinite loop — this effect
    // dispatches addPackage which updates packages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataModulesInfo, dispatch, isSuccessModulesInfo, modules]);
};
