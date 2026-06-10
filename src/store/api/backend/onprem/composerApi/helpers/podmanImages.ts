import cockpit from 'cockpit';

import { inferDistro } from './inferDistro';

import { BootcDistributionItem } from '../../../hosted';
import { PodmanImageInfo, ValidatedPodmanImage } from '../../types';

export const listPodmanImages = async () => {
  try {
    const result = (await cockpit.spawn(
      ['podman', 'images', '--format', 'json'],
      {
        // Root is required to access system-level podman images
        superuser: 'require',
      },
    )) as string;

    if (!result.trim()) {
      return '[]';
    }

    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to list local images', error);
    throw new Error('Unable to list local images');
  }
};

export const filterBootcImages = (arch: string | undefined) => {
  return (image: PodmanImageInfo): image is ValidatedPodmanImage => {
    // we use the names to get the full image reference,
    // if this is empty, there isn't really a fallback,
    // so we should just filter this item out
    if (!image.Names?.length) {
      return false;
    }

    if (!image.Labels) {
      return false;
    }

    if (image.Labels.architecture !== arch) {
      return false;
    }

    const isBootc =
      image.Labels['containers.bootc'] === '1' ||
      image.Labels['ostree.bootable'] === 'true';

    return isBootc;
  };
};

export const toBootcDistro = (arch: string) => {
  return (image: ValidatedPodmanImage): BootcDistributionItem => {
    const { distro, name } = inferDistro(image);

    return {
      arch: image.Labels.architecture ?? arch,
      distro,
      reference: image.Names[0],
      name,
      type: 'guest-image',
    };
  };
};
