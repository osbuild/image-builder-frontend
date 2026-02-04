import { useMemo } from 'react';

import { ALL_CUSTOMIZATIONS } from './constants';
import { distroDetailsApi as api } from './distributionDetailsApi';
import {
  CustomizationType,
  DistributionDetails,
  RestrictionStrategy,
} from './types';

import { useIsOnPremise } from '../../Hooks';
import { useAppSelector } from '../hooks';
import { ImageTypes } from '../imageBuilderApi';
import {
  selectArchitecture,
  selectDistribution,
  selectIsImageMode,
} from '../wizardSlice';

export type ComputeRestrictionsArgs = {
  isImageMode: boolean;
  isOnPremise: boolean;
  arch: string;
  data: DistributionDetails | undefined;
};

export const computeRestrictions = ({
  isImageMode,
  isOnPremise,
  arch,
  data,
}: ComputeRestrictionsArgs): Record<CustomizationType, RestrictionStrategy> => {
  const result: Record<CustomizationType, RestrictionStrategy> = {} as Record<
    CustomizationType,
    RestrictionStrategy
  >;

  for (const customization of ALL_CUSTOMIZATIONS) {
    if (isImageMode) {
      // users & filesystem are the only allowed customization for image mode,
      const allowed = ['filesystem', 'users'].includes(customization);
      result[customization] = {
        shouldHide: !allowed,
        // users is required for image-mode
        required: customization === 'users',
      };
      continue;
    }

    if (
      isOnPremise &&
      // on-premise doesn't allow first boot & repository
      // customizations just yet
      ['repositories', 'firstBoot'].includes(customization)
    ) {
      result[customization] = {
        shouldHide: true,
        required: false,
      };
      continue;
    }

    result[customization] = {
      shouldHide: false,
      required: false,
    };

    const architectures = data?.architectures;
    if (!architectures) {
      continue;
    }

    if (!Object.keys(architectures).includes(arch)) {
      continue;
    }

    const imageTypes = architectures[arch].image_types;
    // at this point the user probably doesn't have any
    // image types selected, so let's return the default list
    if (!imageTypes || Object.keys(imageTypes).length === 0) {
      continue;
    }

    // we can collect a set of the supported image types, this way we can catch the
    // case where a user selects multiple image types that all don't support a certain
    // customization. For example, wsl & image-installer both don't support fs
    // customizations, so it's safe to hide this option if the user selects both.
    const supportedOptions: Set<string> = new Set();
    for (const imageType of Object.keys(imageTypes)) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!imageTypes[imageType]) continue;

      imageTypes[imageType].supported_blueprint_options?.forEach((option) => {
        supportedOptions.add(option);
      });
    }

    result[customization] = {
      shouldHide: !supportedOptions.has(customization),
      required: false,
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
  const isOnPremise = useIsOnPremise();
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
    return computeRestrictions({
      isImageMode,
      isOnPremise,
      arch,
      data,
    });
  }, [data, arch, isImageMode, isOnPremise]);

  return {
    restrictions,
  };
};
