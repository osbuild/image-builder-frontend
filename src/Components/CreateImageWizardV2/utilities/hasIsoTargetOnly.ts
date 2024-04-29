import { useAppSelector } from '../../../store/hooks';
import { selectImageTypes } from '../../../store/wizardSlice';

export const useHasIsoTargetOnly = () => {
  const environments = useAppSelector(selectImageTypes);
  return environments.length === 1 && environments.includes('image-installer');
};
