import type {
  Architectures,
  GetOscapCustomizationsApiResponse,
} from '@/store/api/backend';
import type {
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
} from '@/store/api/contentSources';

export const mockSearchResults: ApiSearchRpmResponse[] = [
  { package_name: 'test', summary: 'summary for test package' },
  { package_name: 'test-lib', summary: 'test-lib package summary' },
  { package_name: 'testPkg', summary: 'test package summary' },
];

export const mockEpelSearch: ApiSearchRpmResponse[] = [
  { package_name: 'asdf', summary: 'summary for asdf package' },
];

export const mockModuleSearchResults: ApiSearchRpmResponse[] = [
  {
    package_name: 'testModule',
    summary: 'testModule summary',
    package_sources: [
      {
        name: 'testModule',
        type: 'module',
        stream: '1.22',
        end_date: '2025-05-01',
      },
      {
        name: 'testModule',
        type: 'module',
        stream: '1.24',
        end_date: '2027-05-01',
      },
    ],
  },
];

export const mockGroupSearchResults: ApiSearchPackageGroupResponse[] = [
  {
    description: '',
    id: 'grouper',
    package_group_name: 'Grouper group',
    package_list: ['fish1', 'fish2'],
  },
];

export const mockOscapProfile =
  'xccdf_org.ssgproject.content_profile_cis_workstation_l1';

export const mockOscapCustomizations: GetOscapCustomizationsApiResponse = {
  openscap: {
    profile_id: mockOscapProfile,
    profile_name:
      'CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
    profile_description: 'Mock OpenSCAP profile for testing',
  },
  packages: ['aide', 'neovim'],
};

export const mockOscapSearchResults: ApiSearchRpmResponse[] = [
  { package_name: 'aide', summary: 'Advanced Intrusion Detection Environment' },
  { package_name: 'neovim', summary: 'Vim-fork focused on extensibility' },
  { package_name: 'test-lib', summary: 'test-lib package summary' },
];

export const mockArchitectures: Record<string, Architectures> = {
  'rhel-10': [
    {
      arch: 'x86_64',
      image_types: ['aws', 'gcp', 'azure', 'guest-image'],
      repositories: [
        {
          baseurl:
            'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/baseos/os',
          rhsm: true,
        },
      ],
    },
  ],
};
