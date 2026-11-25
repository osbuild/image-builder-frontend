import { SATELLITE_PATH } from '@/constants';
import type { Customizations, Subscription } from '@/store/api/backend';

export const hasSubscription = (
  customizations: Customizations,
): customizations is Customizations & { subscription: Subscription } => {
  return customizations.subscription !== undefined;
};

export const hasSatelliteCommand = (
  customizations: Customizations,
): boolean => {
  const file = customizations.files?.find(
    (file) => file.path === SATELLITE_PATH,
  );
  return !!file?.data;
};
