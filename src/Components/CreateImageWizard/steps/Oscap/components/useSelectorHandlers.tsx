import { useAppDispatch } from '../../../../../store/hooks';
import { addPackage, removePackage } from '../../../../../store/wizardSlice';

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

  return {
    clearCompliancePackages,
    handlePackages,
  };
};
