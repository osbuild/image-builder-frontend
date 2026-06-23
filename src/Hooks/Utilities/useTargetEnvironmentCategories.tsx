import { useMemo } from 'react';

import {
  isPrivateCloud,
  isPublicCloud,
  type MiscFormatType,
  type PrivateCloudType,
  type PublicCloudType,
} from '@/store/slices/wizard';

export const useTargetEnvironmentCategories = (environments: string[]) => {
  const publicClouds = useMemo(
    () =>
      environments.filter((env): env is PublicCloudType => isPublicCloud(env)),
    [environments],
  );

  const privateClouds = useMemo(
    () =>
      environments.filter((env): env is PrivateCloudType =>
        isPrivateCloud(env),
      ),
    [environments],
  );

  const miscFormats = useMemo(
    () =>
      environments.filter(
        // Technically unknown values that aren't private or public clouds would get
        // incorrectly narrowed here, but this is fine since we only render known
        // values with the checkboxes and anything else gets discarded
        (env): env is MiscFormatType =>
          !isPrivateCloud(env) && !isPublicCloud(env),
      ),
    [environments],
  );

  return { publicClouds, privateClouds, miscFormats };
};
