const archMap: Record<string, string> = {
  amd64: 'x86_64',
  arm64: 'aarch64',
  x86_64: 'x86_64',
  aarch64: 'aarch64',
};

export const normalizeArch = (arch: string | undefined): string | undefined =>
  arch ? archMap[arch] : undefined;
