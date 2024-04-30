import {
  AARCH64,
  CENTOS_8,
  CENTOS_9,
  RHEL_8,
  RHEL_9,
  X86_64,
} from '../../constants';
import {
  GetBlueprintsApiResponse,
  CreateBlueprintResponse,
  GetBlueprintComposesApiResponse,
  GetBlueprintApiResponse,
  CreateBlueprintRequest,
  ImageRequest,
  BlueprintResponse,
} from '../../store/imageBuilderApi';

export const mockBlueprintsCreation: CreateBlueprintResponse[] = [
  {
    id: '677b010b-e95e-4694-9813-d11d847f1bfc',
  },
];

export const mockBlueprintIds: Record<MockBlueprintNames, string> = {
  darkChocolate: '677b010b-e95e-4694-9813-d11d847f1bfc',
  rhel8: 'd1c2804a-36a1-41d2-9acd-f8333d1384d9',
  rhel9: 'bb52a4ae-4144-4f41-9a7b-245e3b95709f',
  centos8: 'f43e645a-4bb2-4da8-af0b-a9ce093fb907',
  centos9: '63b47cac-102a-4f02-bf23-1b614fda4a99',
  aarch64: '9b39d1bd-50b7-42df-8d4b-1dd8530877f9',
  x86_64: 'a062c7ab-faac-4e76-bdd1-7d127a1a1a82',
  oscap: '260823fd-0a51-43fd-bc1c-77255848de04',
};

type MockBlueprintNames =
  | 'darkChocolate'
  | 'rhel8'
  | 'rhel9'
  | 'centos8'
  | 'centos9'
  | 'x86_64'
  | 'aarch64'
  | 'oscap';

const mockBlueprintNames = {
  rhel8: 'rhel8',
  rhel9: 'rhel9',
  centos8: 'centos8',
  centos9: 'centos9',
  oscap: 'oscap',
  x86_64: 'x86_64',
  aarch64: 'aarch64',
};

const mockBlueprintDescriptions = {
  rhel8: '',
  rhel9: '',
  centos8: '',
  centos9: '',
  x86_64: '',
  aarch64: '',
  oscap: '',
};

export const mockGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 18 },
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
      id: mockBlueprintIds['rhel8'],
      name: mockBlueprintNames['rhel8'],
      description: mockBlueprintDescriptions['rhel8'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['rhel9'],
      name: mockBlueprintNames['rhel9'],
      description: mockBlueprintDescriptions['rhel9'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['centos8'],
      name: mockBlueprintNames['centos8'],
      description: mockBlueprintDescriptions['centos8'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['centos9'],
      name: mockBlueprintNames['centos9'],
      description: mockBlueprintDescriptions['centos9'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['x86_64'],
      name: mockBlueprintNames['x86_64'],
      description: mockBlueprintDescriptions['x86_64'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['aarch64'],
      name: mockBlueprintNames['aarch64'],
      description: mockBlueprintDescriptions['aarch64'],
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
  distribution: 'rhel-93',
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

export const rhel8CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['rhel8'],
  description: mockBlueprintDescriptions['rhel8'],
  distribution: RHEL_8,
};

export const rhel9CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['rhel9'],
  description: mockBlueprintDescriptions['rhel9'],
  distribution: RHEL_9,
};

export const centos8CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['centos8'],
  description: mockBlueprintDescriptions['centos8'],
  distribution: CENTOS_8,
};

export const centos9CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['centos9'],
  description: mockBlueprintDescriptions['centos9'],
  distribution: CENTOS_9,
};

export const x86_64ImageRequest: ImageRequest = {
  ...baseImageRequest,
  architecture: X86_64,
};

export const x86_64CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['x86_64'],
  description: mockBlueprintDescriptions['x86_64'],
  image_requests: [x86_64ImageRequest],
};

export const aarch64ImageRequest: ImageRequest = {
  ...baseImageRequest,
  architecture: AARCH64,
};

export const aarch64CreateBlueprintRequest: CreateBlueprintRequest = {
  ...baseCreateBlueprintRequest,
  name: mockBlueprintNames['aarch64'],
  description: mockBlueprintDescriptions['aarch64'],
  image_requests: [aarch64ImageRequest],
};

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

const createBlueprintRequests = {
  rhel8: rhel8CreateBlueprintRequest,
  rhel9: rhel9CreateBlueprintRequest,
  centos8: centos8CreateBlueprintRequest,
  centos9: centos9CreateBlueprintRequest,
  x86_64: x86_64CreateBlueprintRequest,
  aarch64: aarch64CreateBlueprintRequest,
  oscap: oscapCreateBlueprintRequest,
};

const createResponse = (
  request: CreateBlueprintRequest,
  name: MockBlueprintNames
) => {
  const response: BlueprintResponse = {
    ...request,
    id: mockBlueprintIds[name],
    description: mockBlueprintDescriptions[name],
  };
  return response;
};

const resolveName = (
  id: string,
  mockBlueprintIds: Record<MockBlueprintNames, string>
) => {
  return Object.keys(mockBlueprintIds).find(
    (key) => mockBlueprintIds[key] === id
  );
};

export const getMockBlueprintResponse = (id: string) => {
  const name: MockBlueprintNames = resolveName(id, mockBlueprintIds);

  switch (id) {
    case mockBlueprintIds['darkChocolate']:
      return darkChocolateBlueprintResponse;
    default:
      return createResponse(createBlueprintRequests[name], name);
  }
};
