import { RHEL_8, RHEL_9 } from '../../constants';
import {
  GetBlueprintsApiResponse,
  CreateBlueprintResponse,
  GetBlueprintComposesApiResponse,
  GetBlueprintApiResponse,
} from '../../store/imageBuilderApi';

export const mockBlueprintsCreation: CreateBlueprintResponse[] = [
  {
    id: '677b010b-e95e-4694-9813-d11d847f1bfc',
  },
];

export const mockGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 11 },
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

export const mockBlueprintDetail: GetBlueprintApiResponse = {
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
