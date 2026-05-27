import cockpit from 'cockpit';

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
