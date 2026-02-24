import type {
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
} from '../../../../../../store/contentSourcesApi';
import type { Architectures } from '../../../../../../store/imageBuilderApi';

export const mockSearchResults: ApiSearchRpmResponse[] = [
  { package_name: 'test', summary: 'summary for test package' },
  { package_name: 'test-lib', summary: 'test-lib package summary' },
  { package_name: 'testPkg', summary: 'test package summary' },
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
