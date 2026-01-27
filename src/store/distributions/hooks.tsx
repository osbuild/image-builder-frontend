import { useMemo } from 'react';

import { ALL_CUSTOMIZATIONS } from './constants';
import { distroDetailsApi as api } from './distributionDetailsApi';
import { CustomizationType, RestrictionStrategy } from './types';

import { useAppSelector } from '../hooks';
import { ImageTypes } from '../imageBuilderApi';
import { selectArchitecture, selectDistribution } from '../wizardSlice';

// Instead of exporting the hook directly from the `restrictedCustomizationsApi`
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
  const isSingleTarget = selectedImageTypes.length === 1;

  const { data } = api.useGetDistributionDetailsQuery({
    distro: distro,
    architecture: [arch],
    imageType: selectedImageTypes,
  });

  const restrictions = useMemo(() => {
    const result: Record<CustomizationType, RestrictionStrategy> = {} as Record<
      CustomizationType,
      RestrictionStrategy
    >;

    for (const customization of ALL_CUSTOMIZATIONS) {
      result[customization] = {
        shouldHide: false,
      };

      const architectures = data?.architectures;
      if (!architectures) {
        continue;
      }

      if (!Object.keys(architectures).includes(arch)) {
        continue;
      }

      const imageTypes = architectures[arch].image_types;
      if (!imageTypes || !isSingleTarget) {
        continue;
      }

      const selectedImageType = Object.keys(imageTypes)[0];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!selectedImageType || !imageTypes[selectedImageType]) {
        continue;
      }

      const supportedOptions =
        imageTypes[selectedImageType].supported_blueprint_options;
      if (!supportedOptions) {
        continue;
      }

      // at this point we're dealing with a single target only
      // so we should know whether or not the customization needs
      // to be hidden for this image type
      result[customization] = {
        shouldHide: !supportedOptions.includes(customization),
      };
    }

    return result;
  }, [data, arch, isSingleTarget]);

  return {
    restrictions,
  };
};
