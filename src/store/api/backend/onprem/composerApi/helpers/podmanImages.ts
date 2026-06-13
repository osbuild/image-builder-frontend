import cockpit from 'cockpit';

import { inferDistro } from './inferDistro';

import { BootcDistributionItem } from '../../../hosted';
import { PodmanImageInfo, ValidatedPodmanImage } from '../../types';

const archMap: Record<string, string> = {
  amd64: 'x86_64',
  arm64: 'aarch64',
  x86_64: 'x86_64',
  aarch64: 'aarch64',
};

export const normalizeArch = (arch: string | undefined): string | undefined =>
  arch ? archMap[arch] : undefined;

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

export const filterBootcImages = (
  arch: string | undefined,
  hostArch?: string,
) => {
  return (image: PodmanImageInfo): image is ValidatedPodmanImage => {
    if (!image.Names?.length) {
      return false;
    }

    if (!image.Labels) {
      return false;
    }

    const filterArch = normalizeArch(arch);
    const imageArch =
      normalizeArch(image.Architecture) ?? normalizeArch(hostArch);
    if (!filterArch || !imageArch || imageArch !== filterArch) {
      return false;
    }

    const isBootc =
      image.Labels['containers.bootc'] === '1' ||
      image.Labels['ostree.bootable'] === 'true';

    return isBootc;
  };
};

export const toBootcDistro = (hostArch?: string) => {
  return (image: ValidatedPodmanImage): BootcDistributionItem => {
    const { distro, name } = inferDistro(image);

    return {
      arch: normalizeArch(image.Architecture) ?? normalizeArch(hostArch) ?? '',
      distro,
      reference: image.Names[0],
      name,
      type: 'guest-image',
    };
  };
};
