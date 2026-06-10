import cockpit from 'cockpit';

export const podmanInspect = async (ids: string[]) => {
  try {
    const result = (await cockpit.spawn(
      ['podman', 'inspect', ...ids, '--format', 'json'],
      {
        // Root is required to access system-level podman images
        superuser: 'require',
      },
    )) as string;

    if (!result.trim()) {
      return '[]';
    }

    return result;
  } catch {
    return '[]';
  }
};
