import isRhel from '@/Utilities/isRhel';

import {
  ALL_CUSTOMIZATIONS,
  computeRestrictions,
  type CustomizationType,
} from '..';

export type ComputeRestrictionStrategyArgs = {
  isImageMode: boolean;
  isOnPremise: boolean;
  distro?: string;
};

export const computeRestrictionStrategy = ({
  isImageMode,
  isOnPremise,
  distro = 'rhel-9',
}: ComputeRestrictionStrategyArgs) => {
  return computeRestrictions({
    imageTypes: {},
    context: {
      isImageMode,
      isOnPremise,
      isRhel: isRhel(distro),
    },
  });
};

export const getAllCustomizationTypes = (): CustomizationType[] => [
  ...ALL_CUSTOMIZATIONS,
];
