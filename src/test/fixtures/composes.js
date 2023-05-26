import { RHEL_8 } from '../../constants';

// CreateImageWizard mocks
export const mockComposesEmpty = {
  meta: {
    count: 0,
  },
  data: [],
};

// ImagesTable mocks
const currentDate = new Date();
const currentDateInString = currentDate.toString();

export const mockComposes = {
  meta: {
    count: 12,
  },
  data: [
    {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_name: 'testImageName',
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
    // kept "running" for backward compatibility
    {
      id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'azure',
            upload_request: {
              type: 'azure',
              options: {},
            },
          },
        ],
      },
    },
    {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
  ],
};

export const mockStatus = {
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
  },
  // kept "running" for backward compatibility
  'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
    image_status: {
      status: 'failure',
      error: {
        reason: 'A dependency error occured',
        details: {
          reason: 'Error in depsolve job',
        },
      },
    },
  },
  'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
    image_status: {
      status: 'pending',
    },
  },
  '42ad0826-30b5-4f64-a24e-957df26fd564': {
    image_status: {
      status: 'building',
    },
  },
  '955944a2-e149-4058-8ac1-35b514cb5a16': {
    image_status: {
      status: 'uploading',
    },
  },
  'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
    image_status: {
      status: 'registering',
    },
  },
  '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
    image_status: {
      status: 'failure',
      error: {
        reason: 'A dependency error occured',
        details: {
          reason: 'Error in depsolve job',
        },
      },
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
  },
  '551de6f6-1533-4b46-a69f-7924051f9bc6': {
    image_status: {
      status: 'building',
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
  },
};

export const mockNoClones = {
  data: null,
};

export const mockClones = {
  data: [
    {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: 'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
    },
    {
      created_at: '2021-04-28 12:31:12.794809 +0000 UTC',
      id: '48fce414-0cc0-4a16-8645-e3f0edec3212',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
    },
    {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '0169538e-515c-477e-b934-f12783939313',
      request: {
        region: 'us-west-2',
        share_with_accounts: ['123123123123'],
      },
    },
    {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '4a851db1-919f-43ca-a7ef-dd209877a77e',
      request: {
        region: 'eu-central-1',
        share_with_accounts: ['000000000000'],
      },
    },
  ],
};

export const mockCloneStatus = {
  'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d': {
    options: {
      ami: 'ami-0e778053cd490ad21',
      region: 'us-west-1',
    },
    status: 'success',
    type: 'aws',
  },
  '48fce414-0cc0-4a16-8645-e3f0edec3212': {
    options: {
      ami: 'ami-9f0asd1tlk2142124',
      region: 'us-west-1',
    },
    status: 'success',
    type: 'aws',
  },
  '0169538e-515c-477e-b934-f12783939313': {
    options: {
      ami: 'ami-9fdskj12fdsak1211',
      region: 'us-west-2',
    },
    status: 'failure',
    type: 'aws',
  },
  '4a851db1-919f-43ca-a7ef-dd209877a77e': {
    options: {
      ami: 'ami-9fdskj12fdsak1211',
      region: 'eu-central-1',
    },
    status: 'success',
    type: 'aws',
  },
};

// ShareImageModal mocks
export const mockComposesShareImageModal = {
  count: 1,
  allIds: ['1579d95b-8f1d-4982-8c53-8c2afa4ab04c'],
  byId: {
    '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4abc',
      image_name: 'testImageName',
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
      clones: [
        'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
        '48fce414-0cc0-4a16-8645-e3f0edec3212',
        '0169538e-515c-477e-b934-f12783939313',
        '4a851db1-919f-43ca-a7ef-dd209877a77e',
      ],
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
    },
  },
  error: null,
};

export const mockClonesShareImageModal = {
  allIds: [
    'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
    '48fce414-0cc0-4a16-8645-e3f0edec3212',
    '0169538e-515c-477e-b934-f12783939313',
    '4a851db1-919f-43ca-a7ef-dd209877a77e',
  ],
  byId: {
    'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d': {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: 'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0e778053cd490ad21',
            region: 'us-west-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
    // Duplicate us-west-1 clone with different ami created one day later
    '48fce414-0cc0-4a16-8645-e3f0edec3212': {
      created_at: '2021-04-28 12:31:12.794809 +0000 UTC',
      id: '48fce414-0cc0-4a16-8645-e3f0edec3212',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-9f0asd1tlk2142124',
            region: 'us-west-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
    '0169538e-515c-477e-b934-f12783939313': {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '0169538e-515c-477e-b934-f12783939313',
      request: {
        region: 'us-west-2',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'failure',
        upload_status: {
          options: {
            ami: 'ami-9fdskj12fdsak1211',
            region: 'us-west-2',
          },
          status: 'failure',
          type: 'aws',
        },
      },
    },
    '4a851db1-919f-43ca-a7ef-dd209877a77e': {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '4a851db1-919f-43ca-a7ef-dd209877a77e',
      request: {
        region: 'eu-central-1',
        share_with_accounts: ['000000000000'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-9fdskj12fdsak1211',
            region: 'eu-central-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
  },
  error: null,
};

export const mockState = {
  clones: { ...mockClonesShareImageModal },
  composes: { ...mockComposesShareImageModal },
  notifications: [],
};
