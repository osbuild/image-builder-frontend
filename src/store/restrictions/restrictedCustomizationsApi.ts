import {
  ALL_CUSTOMIZATION_TYPES,
  type CustomizationType,
  RESTRICTED_IMAGE_TYPES,
  type RestrictedCustomizationApi,
  type RestrictedCustomizationArgs,
} from './types';

import { imageBuilderApi } from '../imageBuilderApi';

export const restrictedCustomizationsApi = imageBuilderApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomizationRestrictions: builder.query<
      RestrictedCustomizationApi,
      RestrictedCustomizationArgs
    >({
      queryFn: ({ selectedImageTypes }) => {
        const isAllowed: Record<CustomizationType, boolean> = {} as Record<
          CustomizationType,
          boolean
        >;

        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          const unsupportedCustomizations = selectedImageTypes.filter(
            (imageType) => {
              // this image type has no customization restrictions
              // so we can just skip ahead to the next type
              if (!RESTRICTED_IMAGE_TYPES[imageType]) return false;

              return !RESTRICTED_IMAGE_TYPES[imageType].includes(customization);
            },
          );

          isAllowed[customization] = unsupportedCustomizations.length === 0;
        }

        return {
          data: {
            isAllowed,
          },
        };
      },
    }),
  }),
});
