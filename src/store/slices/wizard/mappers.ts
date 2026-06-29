// These selectors use createSelector for its declarative composition,
// not memoization. Each mapper produces a fragment of the API request
// body, composed bottom-up from slice selectors into the full
// customizations object.
import { createSelector } from '@reduxjs/toolkit';

import {
  mapAwsUploadRequest,
  mapAzureUploadRequest,
  mapGcpUploadRequest,
} from './cloud';
import { mapComplianceCustomizations } from './compliance';
import { mapContentCustomizations, mapContentImageRequest } from './content';
import { mapFilesystemCustomizations } from './filesystem';
import {
  OCI_UPLOAD_OPTIONS,
  S3_UPLOAD_OPTIONS,
  selectArchitecture,
  selectImageTypes,
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
    // this is essentially a lookup table that dynamically
    // get's the cloud upload options (if they're set) and
    // get's the default upload options for the other image
    // types
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
    };
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
