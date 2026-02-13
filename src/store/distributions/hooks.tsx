import { useMemo } from 'react';

import { ALL_CUSTOMIZATIONS } from './constants';
import { distroDetailsApi as api } from './distributionDetailsApi';
import { CustomizationType, ImageTypeInfo, RestrictionStrategy } from './types';

import isRhel from '../../Utilities/isRhel';
import { selectIsOnPremise } from '../envSlice';
import { useAppSelector } from '../hooks';
import { ImageTypes } from '../imageBuilderApi';
import {
  selectArchitecture,
  selectDistribution,
  selectIsImageMode,
} from '../wizardSlice';

export type SupportContext = {
  isImageMode: boolean;
  isOnPremise: boolean;
  isRhel: boolean;
};

export const isCustomizationSupported = (
  customization: CustomizationType,
  imageType: ImageTypeInfo | undefined,
  ctx: SupportContext,
) => {
  if (ctx.isImageMode) {
    return ['filesystem', 'users'].includes(customization);
  }

  if (
    ctx.isOnPremise &&
    // on-premise doesn't allow first boot & repository
    // customizations just yet
    ['repositories', 'firstBoot'].includes(customization)
  ) {
    return false;
  }

  // only rhel distros support registration
  if (!ctx.isRhel && customization === 'registration') {
    return false;
  }

  const supportedOptions = imageType?.supported_blueprint_options;
  return !supportedOptions || supportedOptions.includes(customization);
};

export type ComputeRestrictionsArgs = {
  imageTypes: Record<string, ImageTypeInfo>;
  context: SupportContext;
};

export const computeRestrictions = ({
  imageTypes,
  context: ctx,
}: ComputeRestrictionsArgs): Record<CustomizationType, RestrictionStrategy> => {
  const result: Record<CustomizationType, RestrictionStrategy> = {} as Record<
    CustomizationType,
    RestrictionStrategy
  >;

  for (const customization of ALL_CUSTOMIZATIONS) {
    const supportedOptions: Set<string> = new Set();

    // This covers the default case at the beginning of the wizard
    // when the user hasn't selected any image types yet
    if (Object.keys(imageTypes).length === 0) {
      if (isCustomizationSupported(customization, undefined, ctx)) {
        supportedOptions.add(customization);
      }
    }

    for (const it of Object.keys(imageTypes)) {
      if (isCustomizationSupported(customization, imageTypes[it], ctx)) {
        supportedOptions.add(customization);
      }
    }

    result[customization] = {
      shouldHide: !supportedOptions.has(customization),
      required: ctx.isImageMode && customization === 'users',
    };
  }

  return result;
};

// Instead of exporting the hook directly from the `distributionDetailsApi`
// let's create a wrapper around this to transform the data so that it is easier
// to work with where we need it. This way it will be easy to decide whether we
// need to hide the customizations or display an alert, without complex conditionals
// in the ui components.
export const useCustomizationRestrictions = ({
  selectedImageTypes,
}: {
  selectedImageTypes: ImageTypes[];
}) => {
  const distro = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);

  const { data } = api.useGetDistributionDetailsQuery(
    {
      distro: distro,
      architecture: [arch],
      imageType: selectedImageTypes,
    },
    {
      skip: isImageMode,
    },
  );

  const restrictions = useMemo(() => {
    let imageTypes = {};
    if (
      data?.architectures &&
      // eslint complains about this always being falsy, but there are cases
      // where this does actually happen and can cause some rendering issues.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      data.architectures[arch] &&
      data.architectures[arch].image_types
    ) {
      imageTypes = data.architectures[arch].image_types;
    }

    return computeRestrictions({
      imageTypes,
      context: {
        isImageMode,
        isOnPremise,
        isRhel: isRhel(distro),
      },
    });
  }, [data, distro, arch, isImageMode, isOnPremise]);

  return {
    restrictions,
  };
};
