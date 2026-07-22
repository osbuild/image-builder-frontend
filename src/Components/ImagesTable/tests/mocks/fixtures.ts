import { RHEL_8, RHEL_9 } from '@/constants';
import {
  ComposesResponse,
  ComposesResponseItem,
  ComposeStatus,
  GetBlueprintComposesApiResponse,
} from '@/store/api/backend';

const currentDate = new Date();
const currentDateInString = currentDate.toISOString();

export const composesEndpoint = (url: URL) => {
  const params = new URLSearchParams(url.search);
  const limit = Number(params.get('limit')) || 100;
  const offset = Number(params.get('offset')) || 0;

  return {
    meta: {
      count: mockComposes.length,
    },
    links: {
      first: '',
      last: '',
    },
    data: mockComposes.slice(offset, offset + limit),
  } as ComposesResponse;
};

export const DARK_CHOCOLATE_BLUEPRINT_ID =
  '677b010b-e95e-4694-9813-d11d847f1bfc';

export const mockComposes: ComposesResponseItem[] = [
  {
    id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
    image_name: 'test-image-name',
    created_at: '2021-04-27T12:31:12Z',
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
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
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
  {
    id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '42ad0826-30b5-4f64-a24e-957df26fd564',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '955944a2-e149-4058-8ac1-35b514cb5a16',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'f7a60094-b376-4b58-a102-5c8c82dfd18b',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: '61b0effa-c901-4ee5-86b9-2010b47f1b22',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'ca03f120-9840-4959-871e-94a5cb49d1f2',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
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
  {
    id: '551de6f6-1533-4b46-a69f-7924051f9bc6',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'azure',
          upload_request: {
            type: 'azure',
            options: {
              resource_group: 'my_resource_group',
              hyper_v_generation: 'V2',
            },
          },
        },
      ],
    },
  },
  {
    created_at: '2021-04-27T12:31:12Z',
    id: 'b7193673-8dcc-4a5f-ac30-e9f4940d8346',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vsphere',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    created_at: '2021-04-27T12:31:12Z',
    id: 'hyk93673-8dcc-4a61-ac30-e9f4940d8346',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vsphere-ova',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    created_at: '2021-04-27T12:31:12Z',
    id: '4873fd0f-1851-4b9f-b4fe-4639fce90794',
    request: {
      distribution: RHEL_8,
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
  {
    created_at: currentDateInString,
    id: '7b7d0d51-7106-42ab-98f2-f89872a9d599',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    id: '1679d95b-8f1d-4982-8c53-8c2afa4ab04c',
    image_name: 'test-oscap-image-name',
    created_at: '2021-04-27T12:31:12Z',
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    id: '9e7d0d51-7106-42ab-98f2-f89872a9d599',
    created_at: currentDateInString,
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    },
  },
  {
    id: '1c00daa5-1cfe-4765-8fdd-d1dccf841baf',
    created_at: currentDateInString,
    request: {
      distribution: RHEL_8,
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'azure',
          upload_request: {
            type: 'azure',
            options: {
              resource_group: 'my_resource_group',
              hyper_v_generation: 'V2',
            },
          },
        },
      ],
    },
  },
  {
    id: '0c1ec8d8-be39-47f2-9bd4-a3fff8244fce',
    created_at: '2023-10-17T00:01:02Z',
    image_name: 'oci-image',
    request: {
      distribution: RHEL_9,
      image_name: 'oci-image',
      customizations: {},
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'oci',
          upload_request: {
            type: 'oci.objectstorage',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'ea23cfd6-fd8b-43ed-adfc-9f76bb8487ef',
    created_at: currentDateInString,
    image_name: 'expiring-oci-image',
    request: {
      distribution: RHEL_9,
      image_name: 'oci-image',
      customizations: {},
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'oci',
          upload_request: {
            type: 'oci.objectstorage',
            options: {},
          },
        },
      ],
    },
  },
  {
    id: 'bp-package-mode-compose',
    image_name: 'package-mode-bp-image',
    created_at: '2024-02-01T10:00:00Z',
    blueprint_id: DARK_CHOCOLATE_BLUEPRINT_ID,
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
  {
    id: 'bp-image-mode-compose',
    image_name: 'image-mode-bp-image',
    created_at: '2024-02-01T10:00:00Z',
    blueprint_id: DARK_CHOCOLATE_BLUEPRINT_ID,
    blueprint_version: 1,
    request: {
      distribution: RHEL_9,
      bootc: {
        reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
      },
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
    },
  },
  {
    id: '63e42aaf-b543-41c6-899f-3de1e61838dc',
    image_name: 'dark-chocolate-v2',
    created_at: '2023-09-08T14:38:00.000Z',
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
    id: 'image-mode-bootc-rhel9',
    image_name: 'image-mode-rhel9',
    created_at: '2024-01-15T10:00:00Z',
    request: {
      bootc: {
        reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
      },
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            type: 'local',
            options: {},
          },
        },
      ],
    },
  } as unknown as ComposesResponseItem,
];

export const mockStatus = (composeId: string): ComposeStatus | undefined => {
  const statuses: Record<string, ComposeStatus> = {
    '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0217b81d9be50e44b',
            region: 'us-east-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: { share_with_accounts: ['123123123123'] },
            },
          },
        ],
      },
    },
    'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'A dependency error occured',
          details: { reason: 'Error in depsolve job' },
        },
      },
      request: {
        distribution: RHEL_8,
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
    'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
      image_status: { status: 'pending' },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: { type: 'aws', options: {} },
          },
        ],
      },
    },
    '42ad0826-30b5-4f64-a24e-957df26fd564': {
      image_status: { status: 'building' },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: { type: 'aws', options: {} },
          },
        ],
      },
    },
    '955944a2-e149-4058-8ac1-35b514cb5a16': {
      image_status: { status: 'uploading' },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: { type: 'aws', options: {} },
          },
        ],
      },
    },
    'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
      image_status: { status: 'registering' },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: { type: 'aws', options: {} },
          },
        ],
      },
    },
    '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'A dependency error occured',
          details: { reason: 'Error in depsolve job' },
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: { type: 'aws', options: {} },
          },
        ],
      },
    },
    'ca03f120-9840-4959-871e-94a5cb49d1f2': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            image_name: 'composer-api-d446d8cb-7c16-4756-bf7d-706293785b05',
            project_id: 'red-hat-image-builder',
          },
          status: 'success',
          type: 'gcp',
        },
      },
      request: {
        distribution: RHEL_8,
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
    '551de6f6-1533-4b46-a69f-7924051f9bc6': {
      image_status: { status: 'building' },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'azure',
            upload_request: {
              type: 'azure',
              options: {
                resource_group: 'my_resource_group',
                hyper_v_generation: 'V2',
              },
            },
          },
        ],
      },
    },
    'b7193673-8dcc-4a5f-ac30-e9f4940d8346': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/b7193673-8dcc-4a5f-ac30-e9f4940d8346-disk.vmdk',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vsphere',
            upload_request: { options: {}, type: 'aws.s3' },
          },
        ],
      },
    },
    'hyk93673-8dcc-4a61-ac30-e9f4940d8346': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/hyk93673-8dcc-4a61-ac30-e9f4940d8346-disk.vmdk',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vsphere-ova',
            upload_request: { options: {}, type: 'aws.s3' },
          },
        ],
      },
    },
    '4873fd0f-1851-4b9f-b4fe-4639fce90794': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/4873fd0f-1851-4b9f-b4fe-4639fce90794-installer.iso',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'image-installer',
            upload_request: { options: {}, type: 'aws.s3' },
          },
        ],
      },
    },
    '7b7d0d51-7106-42ab-98f2-f89872a9d599': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/7b7d0d51-7106-42ab-98f2-f89872a9d599-disk.qcow2',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { options: {}, type: 'aws.s3' },
          },
        ],
      },
    },
    '1679d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/1679d95b-8f1d-4982-8c53-8c2afa4ab04c-disk.qcow2',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { type: 'aws.s3', options: {} },
          },
        ],
      },
    },
    '9e7d0d51-7106-42ab-98f2-f89872a9d599': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'Something went very wrong',
          details: { reason: 'There was an error' },
        },
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/9e7d0d51-7106-42ab-98f2-f89872a9d599-disk.qcow2',
          },
          status: 'failure',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { options: {}, type: 'aws.s3' },
          },
        ],
      },
    },
    '1c00daa5-1cfe-4765-8fdd-d1dccf841baf': {
      image_status: {
        status: 'failure',
        error: {
          id: 0,
          reason: 'Something went very wrong for Azure',
          details: { reason: 'There was an error' },
        },
        upload_status: {
          options: { image_name: 'name' },
          status: 'failure',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'vhd',
            upload_request: { options: {}, type: 'azure' },
          },
        ],
      },
    },
    '0c1ec8d8-be39-47f2-9bd4-a3fff8244fce': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://oci-link-to-the.objectstorage.in-a-region.oci.customer-oci.com/p/there-is-a-lot-of-characters/b/image-builder-crc-stage/o/osbuild-upload-1234567890123456789',
          },
          status: 'success',
          type: 'oci.objectstorage',
        },
      },
      request: {
        distribution: RHEL_9,
        image_name: 'oci-image',
        customizations: {},
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'oci',
            upload_request: { type: 'oci.objectstorage', options: {} },
          },
        ],
      },
    },
    'ea23cfd6-fd8b-43ed-adfc-9f76bb8487ef': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://oci-link-to-the.objectstorage.in-a-region.oci.customer-oci.com/p/there-is-a-lot-of-characters/b/image-builder-crc-stage/o/osbuild-upload-9876543210987654321',
          },
          status: 'success',
          type: 'oci.objectstorage',
        },
      },
      request: {
        distribution: RHEL_9,
        image_name: 'oci-image',
        customizations: {},
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'oci',
            upload_request: { type: 'oci.objectstorage', options: {} },
          },
        ],
      },
    },
    'bp-package-mode-compose': {
      image_status: {
        status: 'success',
        upload_status: {
          options: { ami: 'ami-0217b81d9be50e44d', region: 'us-east-1' },
          status: 'success',
          type: 'aws',
        },
      },
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: { share_with_accounts: ['123123123123'] },
            },
          },
        ],
      },
    },
    'bp-image-mode-compose': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            url: 'https://s3.amazonaws.com/bp-image-mode-compose-disk.qcow2',
          },
          status: 'success',
          type: 'aws.s3',
        },
      },
      request: {
        distribution: RHEL_9,
        bootc: {
          reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
        },
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { type: 'aws.s3', options: {} },
          },
        ],
      },
    } as unknown as ComposeStatus,
    '63e42aaf-b543-41c6-899f-3de1e61838dc': {
      image_status: {
        status: 'success',
        upload_status: {
          options: { ami: 'ami-0217b81d9be50e44c', region: 'us-east-1' },
          status: 'success',
          type: 'aws',
        },
      },
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: { share_with_accounts: ['123123123123'] },
            },
          },
        ],
      },
    },
    'image-mode-bootc-rhel9': {
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            artifact_path: '/var/lib/osbuild/store/image-mode-rhel9.qcow2',
          },
          status: 'success',
          type: 'local',
        },
      },
      request: {
        bootc: {
          reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
        },
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { type: 'local', options: {} },
          },
        ],
      },
    } as unknown as ComposeStatus,
  };
  return statuses[composeId];
};

export const mockBlueprintComposes: GetBlueprintComposesApiResponse = {
  meta: { count: 2 },
  data: [
    {
      id: 'bp-package-mode-compose',
      image_name: 'package-mode-bp-image',
      created_at: '2024-02-01T10:00:00Z',
      blueprint_id: DARK_CHOCOLATE_BLUEPRINT_ID,
      blueprint_version: 1,
      request: {
        distribution: RHEL_9,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: { share_with_accounts: ['123123123123'] },
            },
          },
        ],
      },
    },
    {
      id: 'bp-image-mode-compose',
      image_name: 'image-mode-bp-image',
      created_at: '2024-02-01T10:00:00Z',
      blueprint_id: DARK_CHOCOLATE_BLUEPRINT_ID,
      blueprint_version: 1,
      request: {
        distribution: RHEL_9,
        bootc: {
          reference: 'registry.redhat.io/rhel9/rhel-bootc:9.7',
        },
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { type: 'aws.s3', options: {} },
          },
        ],
      },
    },
  ],
  links: { first: 'first', last: 'last' },
};
