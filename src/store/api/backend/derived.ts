import type { EndpointBuilder } from '@reduxjs/toolkit/query/react';

import {
  isPrivateCloud,
  isPublicCloud,
  type MiscFormatType,
  type PrivateCloudType,
  type PublicCloudType,
} from '@/store/slices/wizard';

import type {
  BootcDistributionItem,
  DistributionItem,
  Distributions,
} from './hosted';
import { imageBuilderApi } from './hosted/enhancedImageBuilderApi';
import { KNOWN_IMAGES } from './onprem/constants';
import { composerApi } from './onprem/enhancedComposerApi';

export type CategorizedEnvironments = {
  publicClouds: PublicCloudType[];
  privateClouds: PrivateCloudType[];
  miscFormats: MiscFormatType[];
  hasEnvironments: boolean;
};

export type ArchitectureEnvironmentsResult = CategorizedEnvironments;

export type DistributionEnvironmentsResult = CategorizedEnvironments & {
  distributions: BootcDistributionItem[];
};

const isBootcDistribution = (
  item: DistributionItem | BootcDistributionItem,
): item is BootcDistributionItem => 'distro' in item;

export const categorizeEnvironments = (
  environments: string[],
): CategorizedEnvironments => ({
  publicClouds: environments.filter((env): env is PublicCloudType =>
    isPublicCloud(env),
  ),
  privateClouds: environments.filter((env): env is PrivateCloudType =>
    isPrivateCloud(env),
  ),
  miscFormats: environments.filter(
    (env): env is MiscFormatType => !isPublicCloud(env) && !isPrivateCloud(env),
  ),
  hasEnvironments: environments.length > 0,
});

// backendApi is a build-time conditional (composerApi | imageBuilderApi)
// that resolves to exactly one API slice at runtime. TypeScript sees a
// union type which makes injectEndpoints/queryFn inference unwieldy.
// Since the runtime value is always a single concrete slice, the cast
// on the builder parameter is safe.
const backendApi = (
  process.env.IS_ON_PREMISE ? composerApi : imageBuilderApi
) as typeof composerApi;

const derivedApi = backendApi.injectEndpoints({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  endpoints: (builder: EndpointBuilder<any, any, any>) => ({
    getArchitectureEnvironments: builder.query<
      ArchitectureEnvironmentsResult,
      { distribution: Distributions; arch: string }
    >({
      queryFn: async ({ distribution, arch }, api) => {
        const result = await api.dispatch(
          backendApi.endpoints.getArchitectures.initiate(
            { distribution },
            // Skip the cache subscription since we only need the data;
            // the derived endpoint manages its own cache entry.
            { subscribe: false },
          ),
        );

        if (result.error) {
          return { error: result.error };
        }

        if (!result.data) {
          return { error: { error: 'No architecture results returned' } };
        }

        const imageTypes =
          result.data.find((a) => a.arch === arch)?.image_types ?? [];

        return { data: categorizeEnvironments(imageTypes) };
      },
    }),

    getDistributionEnvironments: builder.query<
      DistributionEnvironmentsResult,
      { arch: string; distro?: string; imageSource?: string }
    >({
      queryFn: async ({ imageSource, ...queryArgs }, api) => {
        const result = await api.dispatch(
          backendApi.endpoints.getDistributions.initiate(
            { kind: 'bootc', ...queryArgs },
            // Skip the cache subscription since we only need the data;
            // the derived endpoint manages its own cache entry.
            { subscribe: false },
          ),
        );

        if (result.error) {
          return { error: result.error };
        }

        if (!result.data) {
          return {
            error: { error: 'No distribution results returned' },
          };
        }

        const distributions = result.data.filter(isBootcDistribution);

        // When an exact image reference is provided, narrow the
        // available target types to only those matching that image.
        // This is used on-prem where each container image supports
        // a single output type via its image-builder.image.type label.
        const selectedType = imageSource
          ? (distributions.find((d) => d.reference === imageSource)?.type ??
            KNOWN_IMAGES.find((k) => k.reference === imageSource)?.type)
          : undefined;

        const imageTypes = selectedType
          ? [selectedType]
          : [...new Set(distributions.map((d) => d.type))];

        return {
          data: {
            ...categorizeEnvironments(imageTypes),
            distributions,
          },
        };
      },
    }),
  }),
});

export const {
  useGetArchitectureEnvironmentsQuery,
  useGetDistributionEnvironmentsQuery,
} = derivedApi;
