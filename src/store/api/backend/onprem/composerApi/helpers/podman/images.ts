import cockpit from 'cockpit';

export const checkImageExists = async (reference: string) => {
  try {
    await cockpit.spawn(['podman', 'image', 'exists', reference], {
      superuser: 'require',
    });
    return true;
  } catch {
    return false;
  }
};

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
