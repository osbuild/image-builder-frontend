import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';
import { selectIsOnPremise } from '@/store/slices/env';

export const selectImageSource = (state: RootState) => {
  return state.wizard.output.imageSource;
};

export const selectImageSourceType = (state: RootState) => {
  return state.wizard.output.imageSourceType;
};

export const selectIsoPayloadReference = (state: RootState) => {
  return state.wizard.output.isoPayloadReference;
};

export const selectBootcDistributions = (state: RootState) => {
  return state.wizard.output.bootcDistributions;
};

export const selectArchitecture = (state: RootState) => {
  return state.wizard.output.architecture;
};

export const selectDistribution = (state: RootState) => {
  return state.wizard.output.distribution;
};

export const selectImageTypes = (state: RootState) => {
  return state.wizard.output.imageTypes;
};

export const selectIsOnlyNetworkInstallerSelected = createSelector(
  selectImageTypes,
  (imageTypes) =>
    imageTypes.length === 1 && imageTypes.includes('network-installer'),
);

export const selectIsOtherEnvironmentSelected = createSelector(
  selectImageTypes,
  (imageTypes) =>
    imageTypes.length >= 1 && !imageTypes.includes('network-installer'),
);

export const selectImageSourceFilter = createSelector(
  selectIsOnPremise,
  selectImageSource,
  (
    isOnPremise,
    imageSource,
  ): { imageSource: string } | Record<string, never> =>
    isOnPremise && imageSource ? { imageSource } : {},
);
