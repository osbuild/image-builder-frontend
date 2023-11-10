import { RHEL_9 } from '../../constants';
import {
  CreateBlueprintResponse,
  GetBlueprintsResponse,
} from '../../store/imageBuilderApi';

export const mockBlueprints: CreateBlueprintResponse[] = [
  {
    id: '677b010b-e95e-4694-9813-d11d847f1bfc',
  },
];

export const mockGetBlueprints = (): GetBlueprintsResponse => {
  return [
    {
      id: '677b010b-e95e-4694-9813-d11d847f1bfc',
      name: 'blueprint1',
      description: 'description1',
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
      customizations: {},
    },
    {
      id: '677b010b-e95e-4694-9813-d11d847f1bfd',
      name: 'blueprint2',
      description: 'description2',
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
      customizations: {},
    },
  ];
};
