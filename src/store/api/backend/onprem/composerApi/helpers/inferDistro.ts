import { ValidatedPodmanImage } from '../../types';

type InferredDistro = {
  distro: string;
  name: string;
};

export const inferDistro = (image: ValidatedPodmanImage): InferredDistro => {
  const labels = image.Labels;
  const reference = image.Names[0].toLowerCase();
  const version = labels.version;

  // RHEL — has redhat.id label
  if (labels['redhat.id']) {
    const v = version ?? 'unknown';
    return {
      distro: `rhel-${v}`,
      name: `Red Hat Enterprise Linux (RHEL) ${v}`,
    };
  }

  // Fedora Hummingbird — check before generic Fedora
  if (reference.includes('hummingbird')) {
    return {
      distro: 'hummingbird',
      name: 'Fedora Hummingbird',
    };
  }

  // Fedora — name label or reference contains 'fedora'
  if (
    labels.name?.toLowerCase().includes('fedora') ||
    reference.includes('fedora')
  ) {
    if (version) {
      return {
        distro: `fedora-${version}`,
        name: `Fedora ${version}`,
      };
    }
    return {
      distro: 'fedora',
      name: 'Fedora',
    };
  }

  // CentOS Stream — name label or reference contains 'centos'
  if (
    labels.name?.toLowerCase().includes('centos') ||
    reference.includes('centos')
  ) {
    if (version) {
      return {
        distro: `centos-${version}`,
        name: `CentOS Stream ${version}`,
      };
    }
    return {
      distro: 'centos',
      name: 'CentOS Stream',
    };
  }

  // Fallback — use the image reference as the name
  return {
    distro: image.Names[0],
    name: image.Names[0],
  };
};
