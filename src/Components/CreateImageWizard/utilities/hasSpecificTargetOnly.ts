import { useAppSelector } from '../../../store/hooks';
import { ImageTypes } from '../../../store/imageBuilderApi';
import { selectImageTypes } from '../../../store/wizardSlice';

export const useHasSpecificTargetOnly = (target: ImageTypes) => {
  const environments = useAppSelector(selectImageTypes);
  return environments.length === 1 && environments.includes(target);
};
