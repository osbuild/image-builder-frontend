import { useEffect, useMemo } from 'react';

import { simpleTargetNames } from '@/constants';
import { ImageTypes } from '@/store/api/backend';
import { useSearchRpmMutation } from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
  selectIsImageMode,
  selectLocaleLangpackCandidates,
  setVerifiedLocaleLangpacks,
} from '@/store/slices/wizard';
import { asDistribution, isImageType } from '@/store/typeGuards';
import isRhel from '@/Utilities/isRhel';

import { ALL_CUSTOMIZATIONS } from './constants';
import { distroDetailsApi as api } from './distributionDetailsApi';
import {
  ArchitectureInfo,
  CustomizationType,
  ImageTypeInfo,
  RestrictionStrategy,
} from './types';

const extractImageTypes = ({
  architectures,
  arch,
}: {
  architectures: Record<string, ArchitectureInfo> | undefined;
  arch: string;
}): Record<string, ImageTypeInfo> => {
  if (
    !architectures ||
    // eslint complains about this always being falsy, but there are cases
    // where this does actually happen and can cause some rendering issues.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !architectures[arch] ||
    !architectures[arch].image_types
  ) {
    return {};
  }

  return architectures[arch].image_types;
};

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
  if (
    ctx.isOnPremise &&
    // on-premise doesn't allow first boot & repository
    // customizations just yet
    ['repositories', 'firstBoot'].includes(customization)
  ) {
    return false;
  }

  let supportedOptions = imageType?.supported_blueprint_options;
  if (ctx.isImageMode) {
    // Image mode at most supports filesystem and users, and might not support any customization.
    supportedOptions = supportedOptions?.filter((c) =>
      ['filesystem', 'users'].includes(c),
    ) ?? ['filesystem', 'users'];
  }

  // only rhel distros support registration
  if (
    !ctx.isRhel &&
    (customization === 'registration' || customization === 'aap')
  ) {
    return false;
  }

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
      required: ctx.isImageMode && ctx.isOnPremise && customization === 'users',
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

  const { data } = api.useGetDistributionDetailsQuery({
    distro: distro,
    architecture: [arch],
    imageType: selectedImageTypes,
  });

  const restrictions = useMemo(() => {
    const imageTypes = extractImageTypes({
      architectures: data?.architectures,
      arch,
    });

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

export type ImageTypeCustomizationSupport = {
  name: string | undefined;
  supported: boolean;
};

export const computeImageTypeCustomizationSupport = (
  imageTypes: Record<string, ImageTypeInfo>,
  customization: CustomizationType,
  context: SupportContext,
): ImageTypeCustomizationSupport[] => {
  return (
    Object.keys(imageTypes)
      .map((it) => {
        // we should be okay here, but it's better to be a bit
        // defensive and add a typecheck
        if (!isImageType(it)) {
          return {
            name: undefined,
            supported: false,
          };
        }

        const imageTypeName = simpleTargetNames[it];
        const isSupported = isCustomizationSupported(
          customization,
          imageTypes[it],
          context,
        );

        return {
          supported: isSupported,
          name: imageTypeName,
        };
      })
      // this is again a defensive check just incase the
      // naming lookup fails or returns an undefined result
      .filter(({ name }) => name)
  );
};

export const useImageTypeCustomizationSupport = (
  customization: CustomizationType,
) => {
  const distro = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);
  const selectedImageTypes = useAppSelector(selectImageTypes);

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

  if (selectedImageTypes.length === 1) {
    // if there is only one image type selected the wizard will
    // hide the unsupported steps, so we can just return an empty
    // array and labels won't be generated.
    return [];
  }

  const imageTypes = extractImageTypes({
    architectures: data?.architectures,
    arch,
  });

  return computeImageTypeCustomizationSupport(imageTypes, customization, {
    isImageMode,
    isOnPremise,
    isRhel: isRhel(distro),
  });
};

const extractPackageNames = (data: { package_name?: string }[]): string[] =>
  Array.from(
    new Set(data.flatMap((d) => (d.package_name ? [d.package_name] : []))),
  );

export const useSearchLanguagePacks = (distroUrls: string[]) => {
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const candidateLangpacks = useAppSelector(selectLocaleLangpackCandidates);
  const [searchRpms, { isLoading: isSearchLoading }] = useSearchRpmMutation();

  useEffect(() => {
    if (candidateLangpacks.length === 0) {
      dispatch(setVerifiedLocaleLangpacks([]));
      return;
    }
    if (!process.env.IS_ON_PREMISE && distroUrls.length === 0) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      const request = process.env.IS_ON_PREMISE
        ? {
            packages: candidateLangpacks,
            architecture: arch,
            distribution: asDistribution(distribution),
          }
        : { exact_names: candidateLangpacks, urls: distroUrls, limit: 500 };

      try {
        const data = await searchRpms({
          apiContentUnitSearchRequest: request,
        }).unwrap();
        const verified = extractPackageNames(
          data as { package_name?: string }[],
        );
        if (!cancelled) dispatch(setVerifiedLocaleLangpacks(verified));
      } catch {
        if (!cancelled) dispatch(setVerifiedLocaleLangpacks([]));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    arch,
    distribution,
    distroUrls,
    dispatch,
    candidateLangpacks,
    searchRpms,
  ]);

  return { isLoading: isSearchLoading };
};
