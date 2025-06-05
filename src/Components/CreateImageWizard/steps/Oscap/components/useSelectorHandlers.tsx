import { useAppDispatch } from '../../../../../store/hooks';
import { Services } from '../../../../../store/imageBuilderApi';
import {
  addPackage,
  changeDisabledServices,
  changeEnabledServices,
  changeMaskedServices,
  removePackage,
} from '../../../../../store/wizardSlice';

export const useSelectorHandlers = () => {
  const dispatch = useAppDispatch();

  const clearCompliancePackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
  };

  const handlePackages = (
    oldOscapPackages: string[],
    newOscapPackages: string[],
    reason: string
  ) => {
    clearCompliancePackages(oldOscapPackages);

    for (const pkg of newOscapPackages) {
      dispatch(
        addPackage({
          name: pkg,
          summary: reason,
          repository: 'distro',
        })
      );
    }
  };

  const handleServices = (services: Services | undefined) => {
    dispatch(changeEnabledServices(services?.enabled || []));
    dispatch(changeMaskedServices(services?.masked || []));
    dispatch(changeDisabledServices(services?.disabled || []));
  };

  return {
    clearCompliancePackages,
    handlePackages,
    handleServices,
  };
};
