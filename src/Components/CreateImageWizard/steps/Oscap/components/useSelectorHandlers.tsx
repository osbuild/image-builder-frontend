import { useAppDispatch } from '../../../../../store/hooks';
import { removePackage } from '../../../../../store/wizardSlice';

export const useSelectorHandlers = () => {
  const dispatch = useAppDispatch();

  const clearCompliancePackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
  };

  return {
    clearCompliancePackages,
  };
};
