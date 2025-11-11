export const requiredRedHatRepos = (
  arch?: string,
  version?: string,
): string[] | undefined => {
  if (!arch || !version) return;
  switch (true) {
    case arch === 'x86_64' && version === '8':
      return [
        'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os/',
        'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/baseos/os/',
      ];
    case arch === 'x86_64' && version === '9':
      return [
        'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/appstream/os/',
        'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os/',
      ];
    case arch === 'x86_64' && version === '10':
      return [
        'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/appstream/os/',
        'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/baseos/os/',
      ];
    case arch === 'aarch64' && version === '8':
      return [
        'https://cdn.redhat.com/content/dist/rhel8/8/aarch64/appstream/os/',
        'https://cdn.redhat.com/content/dist/rhel8/8/aarch64/baseos/os/',
      ];
    case arch === 'aarch64' && version === '9':
      return [
        'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/appstream/os/',
        'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/baseos/os/',
      ];
    case arch === 'aarch64' && version === '10':
      return [
        'https://cdn.redhat.com/content/dist/rhel10/10/aarch64/appstream/os/',
        'https://cdn.redhat.com/content/dist/rhel10/10/aarch64/baseos/os/',
      ];

    default:
      return;
  }
};
