import { useAppSelector } from '../../../store/hooks';
import { selectImageTypes } from '../../../store/wizardSlice';

/**
 * Hook to check if network-installer is in the selected image types.
 * Network-installer does not support any customizations.
 */
export const useHasNetworkInstaller = () => {
  const imageTypes = useAppSelector(selectImageTypes);
  return imageTypes.includes('network-installer');
};

/**
 * Hook to check if network-installer is the ONLY selected image type.
 */
export const useHasNetworkInstallerOnly = () => {
  const imageTypes = useAppSelector(selectImageTypes);
  return imageTypes.length === 1 && imageTypes.includes('network-installer');
};
