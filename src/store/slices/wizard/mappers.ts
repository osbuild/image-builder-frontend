// These selectors use createSelector for its declarative composition,
// not memoization. Each mapper produces a fragment of the API request
// body, composed bottom-up from slice selectors into the full
// customizations object.
import { createSelector } from '@reduxjs/toolkit';

import type { CreateBlueprintRequest } from '@/store/api/backend';
import type { RootState } from '@/store/index';

import {
  mapAwsUploadRequest,
  mapAzureUploadRequest,
  mapGcpUploadRequest,
} from './cloud';
import { mapComplianceCustomizations } from './compliance';
import { mapContentCustomizations, mapContentImageRequest } from './content';
import {
  selectBlueprintDescription,
  selectBlueprintName,
  selectMetadata,
} from './details';
import { mapFilesystemCustomizations } from './filesystem';
import {
  mapBootcOptions,
  OCI_UPLOAD_OPTIONS,
  S3_UPLOAD_OPTIONS,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
  type SupportedImageTypes,
} from './output';
import {
  mapRegistrationCustomizations,
  mapSatelliteFiles,
} from './registration';
import { mapFirstbootFiles, mapSystemCustomizations } from './system';

export const mapFileCustomizations = createSelector(
  [mapSatelliteFiles, mapFirstbootFiles],
  (satellite, firstboot) => {
    if (satellite.length === 0 && firstboot.length === 0) {
      return undefined;
    }

    return { files: [...satellite, ...firstboot] };
  },
);

export const mapCustomizations = createSelector(
  [
    mapFileCustomizations,
    mapRegistrationCustomizations,
    mapContentCustomizations,
    mapComplianceCustomizations,
    mapFilesystemCustomizations,
    mapSystemCustomizations,
  ],
  (files, subscription, content, compliance, filesystem, system) => ({
    customizations: {
      // first boot & satellite use file customizations
      ...files,
      // subscription, aap_registration + cacerts
      ...subscription,
      // packages, modules, payload repos + custom repos
      ...content,
      // fips + openscap
      ...compliance,
      // disk, filesystem + partition mode
      ...filesystem,
      // users, groups, services, hostname, kernel, timezone, locale + firewall
      ...system,
    },
  }),
);

const mapUploadRequest = createSelector(
  [mapAwsUploadRequest, mapAzureUploadRequest, mapGcpUploadRequest],
  (awsUploadOptions, azureUploadOptions, gcpOptions) => {
    return {
      aws: awsUploadOptions,
      ami: awsUploadOptions,
      azure: azureUploadOptions,
      vhd: azureUploadOptions,
      gcp: gcpOptions,
      oci: OCI_UPLOAD_OPTIONS,
      wsl: S3_UPLOAD_OPTIONS,
      'guest-image': S3_UPLOAD_OPTIONS,
      'image-installer': S3_UPLOAD_OPTIONS,
      'bootable-container-iso': S3_UPLOAD_OPTIONS,
      'network-installer': S3_UPLOAD_OPTIONS,
      vsphere: S3_UPLOAD_OPTIONS,
      'vsphere-ova': S3_UPLOAD_OPTIONS,
      'pxe-tar-xz': S3_UPLOAD_OPTIONS,
    } satisfies Record<SupportedImageTypes, { upload_request: unknown }>;
  },
);

export const mapImageRequests = createSelector(
  [
    selectImageTypes,
    selectArchitecture,
    mapContentImageRequest,
    mapUploadRequest,
  ],
  (
    imageTypes,
    architecture,
    contentStateToImageRequest,
    uploadRequestOptions,
  ) => {
    return {
      image_requests: imageTypes.map((imageType) => ({
        architecture,
        image_type: imageType,
        ...uploadRequestOptions[imageType],
        ...contentStateToImageRequest,
      })),
    };
  },
);

// Plain function instead of createSelector — this is the public entry point
// called from event handlers, never during render, so memoization adds no
// value. Keeping it as a plain function makes that intent explicit and avoids
// suggesting this belongs in a useSelector call.
export const mapStateToRequest = (
  state: RootState,
): CreateBlueprintRequest => ({
  name: selectBlueprintName(state),
  metadata: selectMetadata(state),
  description: selectBlueprintDescription(state),
  distribution: selectDistribution(state),
  ...mapBootcOptions(state),
  ...mapImageRequests(state),
  ...mapCustomizations(state),
});
