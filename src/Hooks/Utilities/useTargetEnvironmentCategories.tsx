import { useMemo } from 'react';

import { ImageTypes } from '@/store/api/backend';

type EdgeType =
  | 'edge-commit'
  | 'edge-installer'
  | 'rhel-edge-commit'
  | 'rhel-edge-installer';
export type PublicCloudType = 'aws' | 'ami' | 'azure' | 'gcp' | 'oci' | 'vhd';
export type PrivateCloudType = 'vsphere' | 'vsphere-ova';

export type MiscFormatType = Exclude<
  ImageTypes,
  PublicCloudType | PrivateCloudType | EdgeType
>;

const PUBLIC_CLOUD_TYPES = new Set<PublicCloudType>([
  'aws',
  'ami',
  'azure',
  'gcp',
  'oci',
  'vhd',
]);
const PRIVATE_CLOUD_TYPES = new Set<PrivateCloudType>([
  'vsphere',
  'vsphere-ova',
]);

export const useTargetEnvironmentCategories = (environments: string[]) => {
  const publicClouds = useMemo(
    () =>
      environments.filter((env): env is PublicCloudType =>
        PUBLIC_CLOUD_TYPES.has(env as PublicCloudType),
      ),
    [environments],
  );

  const privateClouds = useMemo(
    () =>
      environments.filter((env): env is PrivateCloudType =>
        PRIVATE_CLOUD_TYPES.has(env as PrivateCloudType),
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
          !PRIVATE_CLOUD_TYPES.has(env as PrivateCloudType) &&
          !PUBLIC_CLOUD_TYPES.has(env as PublicCloudType),
      ),
    [environments],
  );

  return { publicClouds, privateClouds, miscFormats };
};
