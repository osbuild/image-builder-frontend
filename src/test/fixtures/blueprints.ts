import { RHEL_8, RHEL_9 } from '../../constants';
import {
  GetBlueprintsApiResponse,
  CreateBlueprintResponse,
  GetBlueprintComposesApiResponse,
  GetBlueprintApiResponse,
  Distributions,
} from '../../store/imageBuilderApi';

export const mockBlueprintsCreation: CreateBlueprintResponse[] = [
  {
    id: '677b010b-e95e-4694-9813-d11d847f1bfc',
  },
  {
    id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
  },
];

export const mockBlueprintIds = {
  darkChocolate: '677b010b-e95e-4694-9813-d11d847f1bfc',
  rhel9: 'b40509a4-741e-44c8-a2a9-25ef2bbf378c',
  rhel8: 'c6b0bbcf-f006-4059-a20c-4bcafa452b76',
  centos9: '2206aa19-f1ae-4691-a386-e9c3f6c2cf99',
  x86_64: '00ec80dc-a64a-4756-879a-461e98591e6d',
  aarch64: '035810f9-22b6-4118-bdc1-c46183437d40',
  aws: 'ae17f987-0808-4398-a0bb-93605f02768e',
  gcp: '34449e42-1b61-4fd7-9bf2-55210b5f21cd',
  azure: '21698d07-10af-425f-bae3-51e6961318b5',
  registration: '00d2bf0f-55fc-40ae-ad3e-14368c69497a',
  multipleTargets: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
  oscap: '260823fd-0a51-43fd-bc1c-77255848de04',
  fsc: 'ec486dea-78f8-43ee-9c69-8f76b9d1b143',
  snapshot: '5dafa0fc-a5c8-4dc3-8a03-ceeb3677b28a',
  repositories: '6f20ab62-37ba-4afd-9945-734919e9307b',
  packages: 'b3437c4e-f6f8-4270-8d32-323ac60bc929',
  users: '87610289-96e5-4fb6-a359-0e56269ff6de',
  timezone: 'c535dc6e-93b0-4592-ad29-fe46ba7dac73',
  locale: '6e982b49-cd2e-4ad0-9962-39315a0ed9d1',
  hostname: '05677f58-56c5-4c1e-953b-c8a93da70cc5',
  kernel: '8d6d35c7-a098-4bf5-a67f-5c59628210dc',
  firewall: '26f14b17-bdee-4c06-a12b-b6ee384350de',
  services: '718dfa72-c919-4ad8-a02f-a8cd5bbd6edc',
  firstBoot: 'd0a8376e-e44e-47b3-845d-30f5199a35b6',
  details: '58991b91-4b98-47e0-b26d-8d908678ddb3',
  compliance: '21571945-fe23-45e9-8afb-4aa073b8d735',
  // When the cockpit mocks encounter thisblueprint, the cockpit mocks
  // will return all composes. This is to get around the fact that in
  // cockpit, there are no images without blueprints, while that's
  // possible in the service.
  cockpithack: 'b3ff8307-18bd-418a-9a91-836ce039b035',
};

export const mockBlueprintNames = {
  darkChocolate: 'Dark Chocolate',
  rhel9: 'rhel9',
  rhel8: 'rhel8',
  centos9: 'centos9',
  x86_64: 'x86_64',
  aarch64: 'aarch64',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  registration: 'registration',
  oscap: 'oscap',
  fsc: 'fsc',
  snapshot: 'snapshot',
  repositories: 'repositories',
  packages: 'packages',
  users: 'users',
  timezone: 'timezone',
  locale: 'locale',
  hostname: 'hostname',
  kernel: 'kernel',
  firewall: 'firewall',
  services: 'services',
  firstBoot: 'firstBoot',
  details: 'details',
  compliance: 'compliance',
  cockpithack: 'cockpithack',
};

export const mockBlueprintDescriptions = {
  darkChockolate: '70% Dark Chocolate with crunchy cocoa nibs',
  rhel9: '',
  rhel8: '',
  centos9: '',
  x86_64: '',
  aarch64: '',
  aws: '',
  gcp: '',
  azure: '',
  registration: '',
  oscap: '',
  fsc: '',
  snapshot: '',
  repositories: '',
  packages: '',
  users: '',
  timezone: '',
  locale: '',
  hostname: '',
  kernel: '',
  firewall: '',
  services: '',
  firstBoot: '',
  details: 'This is a test description for the Details step.',
  compliance: '',
  cockpithack: 'hacky blueprint for cockpit composes, see fsinfo mock',
};

export const mockGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 28 },
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
      id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      name: 'Multiple Target',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 2,
      last_modified_at: '2021-09-09T14:38:00.000Z',
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
      name: 'Pink Velvet',
      description: 'Layered cake with icing',
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
      id: mockBlueprintIds['rhel8'],
      name: mockBlueprintNames['rhel8'],
      description: mockBlueprintDescriptions['rhel8'],
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
    {
      id: mockBlueprintIds['aws'],
      name: mockBlueprintNames['aws'],
      description: mockBlueprintDescriptions['aws'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['gcp'],
      name: mockBlueprintNames['gcp'],
      description: mockBlueprintDescriptions['gcp'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['azure'],
      name: mockBlueprintNames['azure'],
      description: mockBlueprintDescriptions['azure'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['registration'],
      name: mockBlueprintNames['registration'],
      description: mockBlueprintDescriptions['registration'],
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
      id: mockBlueprintIds['fsc'],
      name: mockBlueprintNames['fsc'],
      description: mockBlueprintDescriptions['fsc'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['snapshot'],
      name: mockBlueprintNames['snapshot'],
      description: mockBlueprintDescriptions['snapshot'],
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
    {
      id: mockBlueprintIds['packages'],
      name: mockBlueprintNames['packages'],
      description: mockBlueprintDescriptions['packages'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['users'],
      name: mockBlueprintNames['users'],
      description: mockBlueprintDescriptions['users'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['timezone'],
      name: mockBlueprintNames['timezone'],
      description: mockBlueprintDescriptions['timezone'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['locale'],
      name: mockBlueprintNames['locale'],
      description: mockBlueprintDescriptions['locale'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['hostname'],
      name: mockBlueprintNames['hostname'],
      description: mockBlueprintDescriptions['hostname'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['kernel'],
      name: mockBlueprintNames['kernel'],
      description: mockBlueprintDescriptions['kernel'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['firewall'],
      name: mockBlueprintNames['firewall'],
      description: mockBlueprintDescriptions['firewall'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['services'],
      name: mockBlueprintNames['services'],
      description: mockBlueprintDescriptions['services'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['firstBoot'],
      name: mockBlueprintNames['firstBoot'],
      description: mockBlueprintDescriptions['firstBoot'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['details'],
      name: mockBlueprintNames['details'],
      description: mockBlueprintDescriptions['details'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['compliance'],
      name: mockBlueprintNames['compliance'],
      description: mockBlueprintDescriptions['compliance'],
      version: 1,
      last_modified_at: '2021-09-08T21:00:00.000Z',
    },
    {
      id: mockBlueprintIds['cockpithack'],
      name: mockBlueprintNames['cockpithack'],
      description: mockBlueprintDescriptions['cockpithack'],
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
        distribution: 'centos-8' as Distributions,
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

export const multipleTargetsBlueprintResponse: GetBlueprintApiResponse = {
  ...mockGetBlueprints.data[2],
  image_requests: mockBlueprintComposes.data[2].request.image_requests,
  distribution: mockBlueprintComposes.data[2].request.distribution,
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
