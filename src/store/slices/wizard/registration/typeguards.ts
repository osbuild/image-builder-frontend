import { SATELLITE_PATH } from '@/constants';
import type { Customizations, Subscription } from '@/store/api/backend';

import { REGISTER_NOW_TYPES } from './constants';
import type { RegisterNowType, RegistrationType } from './types';

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
  type: RegistrationType,
): type is RegisterNowType => {
  return REGISTER_NOW_TYPES.includes(type as RegisterNowType);
};
