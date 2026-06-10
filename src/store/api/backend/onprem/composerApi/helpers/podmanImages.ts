import cockpit from 'cockpit';

import { BootcDistributionItem } from '../../../hosted';
import { PodmanImageInfo, ValidatedPodmanImage } from '../../types';

export const listPodmanImages = async () => {
  try {
    const result = (await cockpit.spawn(
      [
        'podman',
        'images',
        '--filter',
        'reference=registry.redhat.io/rhel*/rhel-bootc',
        '--format',
        'json',
      ],
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

    // just include rhel bootable containers for now
    if (!('redhat.id' in image.Labels)) {
      return false;
    }

    return (
      'containers.bootc' in image.Labels &&
      image.Labels['containers.bootc'] === '1'
    );
  };
};

export const toBootcDistro = (
  image: ValidatedPodmanImage,
): BootcDistributionItem => {
  // at the moment we're filtering out all non-rhel image mode
  // images so we're fine to assume the distro as being a rhel
  // variant. We'll have to re-think this a little bit later on
  const d = `rhel-${image.Labels.version}`;

  return {
    arch: image.Labels.architecture ?? '',
    distro: d,
    reference: image.Names[0],
    // Align with the hosted API naming pattern
    name: `Red Hat Enterprise Linux (RHEL) ${image.Labels.version ?? ''}`,
    // we're hardcoding the image type in here
    // because this is the only target we support
    // on-prem at the moment
    type: 'guest-image',
  };
};
