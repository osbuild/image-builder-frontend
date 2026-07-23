import { isRhel } from '@/store/slices/wizard';

import {
  ALL_CUSTOMIZATIONS,
  computeRestrictions,
  type CustomizationType,
} from '..';

export type ComputeRestrictionStrategyArgs = {
  isImageMode: boolean;
  isOnPremise: boolean;
  distro?: string;
  isImageModeRegistrationEnabled?: boolean;
};

export const computeRestrictionStrategy = ({
  isImageMode,
  isOnPremise,
  distro = 'rhel-9',
  isImageModeRegistrationEnabled,
}: ComputeRestrictionStrategyArgs) => {
  return computeRestrictions({
    imageTypes: {},
    context: {
      isImageMode,
      isOnPremise,
      isRhel: isRhel(distro),
      isImageModeRegistrationEnabled,
    },
  });
};

export const getAllCustomizationTypes = (): CustomizationType[] => [
  ...ALL_CUSTOMIZATIONS,
];
