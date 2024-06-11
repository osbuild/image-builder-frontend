import { RHEL_8, RHEL_9 } from '../../constants';
import {
  GetBlueprintsApiResponse,
  CreateBlueprintResponse,
  GetBlueprintComposesApiResponse,
  GetBlueprintApiResponse,
  CreateBlueprintRequest,
  ImageRequest,
  BlueprintResponse,
  Repository,
  CustomRepository,
} from '../../store/imageBuilderApi';

export const mockBlueprintsCreation: CreateBlueprintResponse[] = [
  {
    id: '677b010b-e95e-4694-9813-d11d847f1bfc',
  },
];

export const mockBlueprintIds = {
  darkChocolate: '677b010b-e95e-4694-9813-d11d847f1bfc',
  oscap: '260823fd-0a51-43fd-bc1c-77255848de04',
  repositories: '6f20ab62-37ba-4afd-9945-734919e9307b',
};

const mockBlueprintNames = {
  oscap: 'oscap',
  repositories: 'repositories',
};

const mockBlueprintDescriptions = {
  oscap: '',
  repositories: '',
};

export const mockGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 13 },
  data: [
    {
      id: '677b010b-e95e-4694-9813-d11d847f1bfc',
      name: 'Dark Chocolate',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 2,
      last_modified_at: '2021-09-09T14:38:00.000Z',
    },
    {
      id: '193482e4-4bd0-4898-a8bc-dc8c33ed669f',
      name: 'Milk Chocolate',
      description: '40% Milk Chocolate with salted caramel',
      version: 1,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
    {
      id: '51243667-8d87-4aef-8dd1-84fc58261b05',
      name: 'Lemon Pie',
      description: 'Crusted lemon pie with meringue topping',
      version: 2,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
    {
      id: 'b1f10309-a250-4db8-ab64-c110176e3eb7',
      name: 'Cupcake',
      description: 'Small cake with frosting',
      version: 1,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
    {
      id: '8642171b-d4e5-408b-af9f-68ce8a640df8',
      name: 'Salted Caramel Cheesecake',
      description: 'Cheesecake topped with salted caramel',
      version: 1,
      last_modified_at: '2021-09-08T15:12:00.000Z',
    },
    {
      id: 'f460c4eb-0b73-4a56-a1a6-5defc7e29d6b',
      name: 'Crustless New York Cheesecake',
      description: 'Creamy delicius cheesecake',
      version: 1,
      last_modified_at: '2021-09-08T16:24:00.000Z',
    },
    {
      id: '366c2c1f-26cd-430a-97a2-f671d7e834b4',
      name: 'Fresh Plum Kuchen',
      description: 'Kuchen made from the best plums',
      version: 1,
      last_modified_at: '2021-09-08T17:03:00.000Z',
    },
    {
      id: '3f1a2e77-43b2-467d-b71b-c031ae8f3b7f',
      name: 'Chocolate Angel Cake',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 1,
      last_modified_at: '2021-09-08T18:10:00.000Z',
    },
    {
      id: '689158a7-aa02-4581-b695-6608383477cb',
      name: 'Cherry Cola Cake',
      description: 'Made from fresh cherries',
      version: 1,
      last_modified_at: '2021-09-08T19:45:00.000Z',
    },
    {
      id: '6f073028-128d-4e6e-af98-0da2e58c8b60',
      name: 'Hummingbird Cake',
      description: 'Banana-pineapple spice cake',
      version: 1,
      last_modified_at: '2021-09-08T20:18:00.000Z',
    },
    {
      id: '147032db-8697-4638-8fdd-6f428100d8fc',
      name: 'Red Velvet',
      description: 'Layered cake with icing',
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['oscap'],
      name: mockBlueprintNames['oscap'],
      description: mockBlueprintDescriptions['oscap'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['repositories'],
      name: mockBlueprintNames['repositories'],
      description: mockBlueprintDescriptions['repositories'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
  ],
};

export const emptyGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 0 },
  data: [],
};

export const mockBlueprintComposesOutOfSync: GetBlueprintComposesApiResponse = {
  meta: { count: 1 },
  data: [
    {
      id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
      image_name: 'Lemon Pie',
      created_at: '2021-09-08T14:38:00.000Z',
      blueprint_version: 1,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};

export const mockCentosBlueprintComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 1 },
  data: [
    {
      id: '4873fd0f-1851-4b9f-b4fe-4639fce90794',
      image_name: 'Cupcake',
      created_at: '2021-04-27T12:31:12Z',
      blueprint_version: 1,
      request: {
        distribution: 'centos-8',
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'image-installer',
            upload_request: {
              options: {},
              type: 'aws.s3',
            },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};

export const mockBlueprintComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 3 },
  data: [
    {
      id: '63e42aaf-b543-41c6-899f-3de1e61838dc',
      image_name: 'dark-chocolate-aws',
      created_at: '2023-09-08T14:38:00.000Z',
      blueprint_version: 2,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_name: 'dark-chocolate-aws',
      created_at: '2021-09-08T14:38:00.000Z',
      blueprint_version: 1,
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
    },
    {
      id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      image_name: 'Dark Chocolate',
      created_at: '2021-04-27T12:31:12Z',
      blueprint_version: 1,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'gcp',
            upload_request: {
              type: 'gcp',
              options: {
                share_with_accounts: ['serviceAccount:test@email.com'],
              },
            },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};

export const mockEmptyBlueprintsComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 0 },
  data: [],
  links: { first: 'first', last: 'last' },
};

export const updatedBlueprints: GetBlueprintsApiResponse = {
  ...mockGetBlueprints,
  data: mockGetBlueprints.data.map((item) => ({
    ...item,
    // Update version to 2 for all items
    version: 2,
    // If the item name is 'Dark Chocolate', rename it to 'Extra Dark Chocolate'
    name: item.name === 'Dark Chocolate' ? 'Extra Dark Chocolate' : item.name,
  })),
};

export const darkChocolateBlueprintResponse: GetBlueprintApiResponse = {
  ...mockGetBlueprints.data[0],
  image_requests: mockBlueprintComposes.data[0].request.image_requests,
  distribution: mockBlueprintComposes.data[0].request.distribution,
  customizations: {
    subscription: {
      organization: 1234,
      'activation-key': '',
      'server-url': '',
      'base-url': '',
      insights: true,
      rhc: true,
    },
  },
};

export const baseImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: {
    options: {},
    type: 'aws.s3',
  },
};

export const baseCreateBlueprintRequest: CreateBlueprintRequest = {
  name: 'Red Velvet',
  description: '',
  distribution: RHEL_9,
  image_requests: [baseImageRequest],
  customizations: {},
};

const expectedOpenscapCisL1 = {
  profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
};

const expectedPackagesCisL1 = ['aide', 'neovim'];

const expectedServicesCisL1 = {
  enabled: ['crond', 'neovim-service'],
  disabled: ['rpcbind', 'autofs', 'nftables'],
  masked: ['nfs-server', 'emacs-service'],
};

const expectedKernelCisL1 = {
  append: 'audit_backlog_limit=8192 audit=1',
};

const expectedFilesystemCisL1 = [
  { min_size: 10737418240, mountpoint: '/' },
  { min_size: 1073741824, mountpoint: '/tmp' },
  { min_size: 1073741824, mountpoint: '/home' },
];

export const oscapCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['oscap'],
  description: mockBlueprintDescriptions['oscap'],
  customizations: {
    packages: expectedPackagesCisL1,
    openscap: expectedOpenscapCisL1,
    services: expectedServicesCisL1,
    kernel: expectedKernelCisL1,
    filesystem: expectedFilesystemCisL1,
  },
};

export const oscapBlueprintResponse: BlueprintResponse = {
  ...oscapCreateBlueprintRequest,
  id: mockBlueprintIds['oscap'],
  description: mockBlueprintDescriptions['oscap'],
};

export const expectedPayloadRepositories: Repository[] = [
  {
    baseurl: 'http://valid.link.to.repo.org/x86_64/',
    check_gpg: true,
    check_repo_gpg: false,
    gpgkey:
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
    rhsm: false,
  },
];

export const expectedCustomRepositories: CustomRepository[] = [
  {
    baseurl: ['http://valid.link.to.repo.org/x86_64/'],
    check_gpg: true,
    check_repo_gpg: false,
    gpgkey: [
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
    ],
    id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
    name: '01-test-valid-repo',
  },
];

export const repositoriesCreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['repositories'],
  description: mockBlueprintDescriptions['repositories'],
  customizations: {
    custom_repositories: expectedCustomRepositories,
    payload_repositories: expectedPayloadRepositories,
  },
};

export const repositoriesBlueprintResponse: BlueprintResponse = {
  ...repositoriesCreateBlueprintRequest,
  id: mockBlueprintIds['repositories'],
  description: mockBlueprintDescriptions['repositories'],
};

export const getMockBlueprintResponses = (id: string) => {
  switch (id) {
    case mockBlueprintIds['darkChocolate']:
      return darkChocolateBlueprintResponse;
    case mockBlueprintIds['oscap']:
      return oscapBlueprintResponse;
    case mockBlueprintIds['repositories']:
      return repositoriesBlueprintResponse;
  }
};
