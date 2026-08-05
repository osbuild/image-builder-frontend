import type { BootcDistributionItem } from '@/store/api/backend';
import {
  PodmanImageInfo,
  ValidatedPodmanImage,
} from '@/store/api/backend/onprem';

import { inferDistro } from './inferDistro';

// The backend (osbuild-composer) uses different names for some image
// types than the frontend. Normalize at the boundary so downstream
// code only deals with frontend types.
export const backendToFrontendType: Record<string, string> = {
  qcow2: 'guest-image',
  ami: 'aws',
};

const normalizeImageType = (type: string): string =>
  backendToFrontendType[type] ?? type;

// The CLI's native type names (e.g. qcow2) are the backend ones, so the
// normalization has to be undone when invoking it. A unit test ensures
// this stays the exact inverse of backendToFrontendType above.
export const frontendToBackendType: Record<string, string> = {
  'guest-image': 'qcow2',
  aws: 'ami',
};

export const toBackendImageType = (type: string): string =>
  frontendToBackendType[type] ?? type;

// Extract numeric version from a distro string like "rhel-10" or
// "rhel-10.3". Returns NaN for non-RHEL distros so they sort after RHEL.
const rhelVersion = (distro: string): number => {
  const match = distro.match(/^rhel-(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : NaN;
};

// Sort comparator: RHEL descending by version, then non-RHEL alphabetical.
export const byDistroDescending = (
  a: BootcDistributionItem,
  b: BootcDistributionItem,
): number => {
  const aVer = rhelVersion(a.distro);
  const bVer = rhelVersion(b.distro);
  if (!isNaN(aVer) && !isNaN(bVer)) return bVer - aVer;
  if (!isNaN(aVer)) return -1;
  if (!isNaN(bVer)) return 1;
  return a.name.localeCompare(b.name);
};

export const filterBootcImages = (
  image: PodmanImageInfo,
): image is ValidatedPodmanImage => {
  // we use the names to get the full image reference,
  // if this is empty, there isn't really a fallback,
  // so we should just filter this item out
  if (!image.RepoTags?.length) {
    return false;
  }

  if (!image.Labels) {
    return false;
  }

  if (!image.Architecture) {
    return false;
  }

  const isBootc =
    image.Labels['containers.bootc'] === '1' ||
    image.Labels['ostree.bootable'] === 'true';

  return isBootc;
};

export const toBootcDistro = (
  image: ValidatedPodmanImage,
): BootcDistributionItem => {
  const { distro, name } = inferDistro(image);

  const rawType = image.Labels['image-builder.image.type'];
  const imageType = rawType ? normalizeImageType(rawType) : 'guest-image';

  return {
    arch: image.Architecture,
    distro,
    reference: image.RepoTags[0],
    name: name,
    type: imageType,
  };
};
