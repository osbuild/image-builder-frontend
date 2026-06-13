import { ValidatedPodmanImage } from '../../types';

type InferredDistro = {
  distro: string;
  name: string;
};

const parseVersionFromTag = (reference: string): string | undefined => {
  const tag = reference.split(':').pop();
  if (!tag) return undefined;
  const match = tag.match(/^(\d+[\d.]*)$/);
  return match?.[1];
};

const parseCentosVersionFromTag = (reference: string): string | undefined => {
  const tag = reference.split(':').pop();
  if (!tag) return undefined;
  const streamMatch = tag.match(/^stream(\d+)$/);
  if (streamMatch) return streamMatch[1];
  const match = tag.match(/^(\d+[\d.]*)$/);
  return match?.[1];
};

export const inferDistro = (image: ValidatedPodmanImage): InferredDistro => {
  const labels = image.Labels;
  const reference = image.Names[0].toLowerCase();
  const version = labels.version;

  // RHEL — has redhat.id label
  if (labels['redhat.id']) {
    const v = version ?? parseVersionFromTag(reference) ?? 'unknown';
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
    const v = version ?? parseVersionFromTag(reference);
    if (v) {
      return {
        distro: `fedora-${v}`,
        name: `Fedora ${v}`,
      };
    }
    return {
      distro: 'fedora',
      name: `Fedora (${image.Names[0]})`,
    };
  }

  // CentOS Stream — name label or reference contains 'centos'
  if (
    labels.name?.toLowerCase().includes('centos') ||
    reference.includes('centos')
  ) {
    const v = version ?? parseCentosVersionFromTag(reference);
    if (v) {
      return {
        distro: `centos-${v}`,
        name: `CentOS Stream ${v}`,
      };
    }
    return {
      distro: 'centos',
      name: `CentOS Stream (${image.Names[0]})`,
    };
  }

  // Fallback — use the image reference as the name
  return {
    distro: image.Names[0],
    name: image.Names[0],
  };
};
