import type { Package, SearchRpmApiArg } from '../../types';

export const createMockPackage = (overrides?: Partial<Package>): Package => ({
  name: 'test-package',
  arch: 'x86_64',
  summary: 'A test package',
  version: '1.0.0',
  release: '1.el9',
  ...overrides,
});

export const createSearchArgs = (
  overrides: Partial<SearchRpmApiArg['apiContentUnitSearchRequest']> = {},
): SearchRpmApiArg => ({
  apiContentUnitSearchRequest: {
    architecture: 'x86_64',
    distribution: 'rhel-9',
    packages: ['vim', 'git'],
    ...overrides,
  },
});

export const isValidSearchArgs = (args: SearchRpmApiArg): boolean => {
  const { architecture, distribution, packages } =
    args.apiContentUnitSearchRequest;
  return !!(architecture && distribution && packages);
};

export const buildRequestBody = (args: SearchRpmApiArg) => {
  const { architecture, distribution, packages } =
    args.apiContentUnitSearchRequest;
  return {
    packages,
    distribution,
    architecture,
  };
};

export const mockPackages: readonly Package[] = [
  createMockPackage({
    name: 'vim',
    summary: 'Vi Improved text editor',
    version: '8.2',
    release: '1.el9',
    arch: 'x86_64',
  }),
  createMockPackage({
    name: 'git',
    summary: 'Fast distributed version control',
    version: '2.39',
    release: '3.el9',
    arch: 'x86_64',
  }),
  createMockPackage({
    name: 'curl',
    summary: 'Command line tool for transferring data',
    version: '7.76',
    release: '14.el9',
    arch: 'x86_64',
  }),
];

export const mockDuplicatePackages: readonly Package[] = [
  createMockPackage({
    name: 'vim',
    summary: 'Vi Improved text editor',
    version: '8.2',
    release: '1.el9',
    arch: 'x86_64',
  }),
  createMockPackage({
    name: 'vim',
    summary: 'Vi Improved text editor',
    version: '8.2',
    release: '2.el9',
    arch: 'x86_64',
  }),
  createMockPackage({
    name: 'git',
    summary: 'Fast distributed version control',
    version: '2.39',
    release: '3.el9',
    arch: 'x86_64',
  }),
];
