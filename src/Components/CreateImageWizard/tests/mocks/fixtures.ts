import { RHEL_9 } from '@/constants';
import { Architectures, GetBlueprintApiResponse } from '@/store/api/backend';

export const mockArchitectures: Record<string, Architectures> = {
  'rhel-8': [
    {
      arch: 'x86_64',
      image_types: [
        'aws',
        'azure',
        'gcp',
        'guest-image',
        'image-installer',
        'oci',
        'vsphere',
        'vsphere-ova',
        'wsl',
      ],
      repositories: [],
    },
    {
      arch: 'aarch64',
      image_types: ['aws', 'guest-image', 'image-installer'],
      repositories: [],
    },
  ],
  'rhel-9': [
    {
      arch: 'x86_64',
      image_types: [
        'aws',
        'azure',
        'gcp',
        'guest-image',
        'image-installer',
        'oci',
        'vsphere',
        'vsphere-ova',
      ],
      repositories: [],
    },
    {
      arch: 'aarch64',
      image_types: ['aws', 'guest-image', 'image-installer'],
      repositories: [],
    },
  ],
  'rhel-10': [
    {
      arch: 'x86_64',
      image_types: [
        'aws',
        'azure',
        'gcp',
        'guest-image',
        'image-installer',
        'network-installer',
        'oci',
        'wsl',
      ],
      repositories: [],
    },
    {
      arch: 'aarch64',
      image_types: ['aws', 'guest-image', 'image-installer'],
      repositories: [],
    },
  ],
};

export const mockBlueprintId = '677b010b-e95e-4694-9813-d11d847f1bfc';

export const mockBlueprint: GetBlueprintApiResponse = {
  id: mockBlueprintId,
  name: 'Test Blueprint',
  description: 'Test blueprint for edit mode',
  distribution: RHEL_9,
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: {
        type: 'aws.s3',
        options: {},
      },
    },
  ],
  customizations: {},
  lint: {
    errors: [],
    warnings: [],
  },
};
