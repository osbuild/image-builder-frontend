import { BootcDistributionItem } from '@/store/api/backend';
import {
  PodmanImageInfo,
  ValidatedPodmanImage,
} from '@/store/api/backend/onprem';

import { inferDistro } from './inferDistro';

// The backend (osbuild-composer) uses different names for some image
// types than the frontend. Normalize at the boundary so downstream
// code only deals with frontend types.
const backendToFrontendType: Record<string, string> = {
  qcow2: 'guest-image',
  ami: 'aws',
};

const normalizeImageType = (type: string): string =>
  backendToFrontendType[type] ?? type;

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
