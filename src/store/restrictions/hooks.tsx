import { useMemo } from 'react';

import { restrictedCustomizationsApi as api } from './restrictedCustomizationsApi';
import {
  ALL_CUSTOMIZATION_TYPES,
  CustomizationType,
  RESTRICTED_IMAGE_TYPES,
  RestrictionStrategy,
} from './types';

import { useIsOnPremise } from '../../Hooks';
import { useAppSelector } from '../hooks';
import { ImageTypes } from '../imageBuilderApi';
import { selectIsImageMode } from '../wizardSlice';

// Instead of exporting the hook directly from the `restrictedCustomizationsApi`
// let's create a wrapper around this to transform the data so that it is easier
// to work with where we need it. This way it will be easy to decide whether we
// need to hide the customizations or display an alert, without complex conditionals
// in the ui components.
export const useGetCustomizationRestrictionsQuery = ({
  selectedImageTypes,
}: {
  selectedImageTypes: ImageTypes[];
}) => {
  const isOnPremise = useIsOnPremise();
  const isImageMode = useAppSelector(selectIsImageMode);
  const isSingleTarget = selectedImageTypes.length === 1;

  const { data } = api.useGetCustomizationRestrictionsQuery({
    selectedImageTypes,
  });

  const restrictions = useMemo(() => {
    const result: Record<CustomizationType, RestrictionStrategy> = {} as Record<
      CustomizationType,
      RestrictionStrategy
    >;

    for (const customization of ALL_CUSTOMIZATION_TYPES) {
      let allowed = data?.isAllowed ? data.isAllowed[customization] : true;

      if (isImageMode) {
        // users & filesystem are the only allowed customization for image mode,
        allowed = ['filesystem', 'users'].includes(customization);
        result[customization] = {
          isAllowed: allowed,
          shouldHide: !allowed,
          // this can be empty since there are no steps that
          // might have conflicting customizations
          supportedImageTypes: [],
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
          isAllowed: false,
          shouldHide: true,
          // these are hidden, so we can leave this empty

          supportedImageTypes: [],
          required: false,
        };
        continue;
      }

      const supportedImageTypes = selectedImageTypes.filter((imageType) => {
        // this image supports this specific customization
        // so we want it in the list of supported image types
        // for the customization
        if (!RESTRICTED_IMAGE_TYPES[imageType]) return true;

        return RESTRICTED_IMAGE_TYPES[imageType].includes(customization);
      });

      result[customization] = {
        isAllowed: allowed,
        shouldHide: !allowed && isSingleTarget,
        supportedImageTypes,
        required: false,
      };
    }

    return result;
  }, [data, selectedImageTypes, isSingleTarget, isImageMode, isOnPremise]);

  return {
    restrictions,
  };
};
