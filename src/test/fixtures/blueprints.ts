import { RHEL_9 } from '../../constants';
import {
  GetBlueprintsApiResponse,
  CreateBlueprintResponse,
  GetBlueprintComposesApiResponse,
} from '../../store/imageBuilderApi';

export const mockBlueprintsCreation: CreateBlueprintResponse[] = [
  {
    id: '677b010b-e95e-4694-9813-d11d847f1bfc',
  },
];

export const mockGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 2 },
  data: [
    {
      id: '677b010b-e95e-4694-9813-d11d847f1bfc',
      name: 'Dark Chocolate',
      description: '70% Dark Chocolate with crunchy cocoa nibs',
      version: 1,
      last_modified_at: '2021-09-09T14:38:00.000Z',
    },
    {
      id: '677b0101-e952-4694-9813-d11d847f1bfc',
      name: 'Milk Chocolate',
      description: '40% Milk Chocolate with salted caramel',
      version: 1,
      last_modified_at: '2021-09-08T14:38:00.000Z',
    },
  ],
};

export const emptyGetBlueprints: GetBlueprintsApiResponse = {
  links: { first: 'first', last: 'last' },
  meta: { count: 0 },
  data: [],
};

export const mockBlueprintComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 2 },
  data: [
    {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_name: 'Dark Chocolate',
      created_at: '2021-09-08T14:38:00.000Z',
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
      id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      created_at: '2021-04-27T12:31:12Z',
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
