import { SATELLITE_PATH } from '@/constants';
import type { Customizations, Subscription } from '@/store/api/backend';

import type { RegistrationSlice } from './types';

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

export const isRegisterNowType = (
  registration: RegistrationSlice,
): registration is RegistrationSlice => {
  return (
    registration.type === 'register-now' ||
    registration.type === 'register-now-insights' ||
    registration.type === 'register-now-rhc'
  );
};
