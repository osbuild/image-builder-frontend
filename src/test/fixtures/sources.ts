import {
  GetSourceListApiResponse,
  GetSourceUploadInfoApiResponse,
} from '../../store/provisioningApi';

export const mockSourcesByProvider = (
  provider: string,
): GetSourceListApiResponse => {
  const mockSources: { [key: string]: GetSourceListApiResponse } = {
    aws: {
      data: [
        {
          id: '123',
          name: 'my_source',
          source_type_id: '1',
          uid: 'de5e35d4-4c1f-49d7-9ef3-7d08e6b9c76a',
        },
      ],
    },
    azure: {
      data: [
        {
          id: '666',
          name: 'azureSource1',
          source_type_id: '3',
          uid: '9f48059c-25db-47ac-81e8-dac7f8a76170',
        },
        {
          id: '667',
          name: 'azureSource2',
          source_type_id: '3',
          uid: '73d5694c-7a28-417e-9fca-55840084f508',
        },
      ],
    },
  };
  return mockSources[provider];
};

export const mockUploadInfo = (
  sourceId: string,
): GetSourceUploadInfoApiResponse => {
  const mockInfo: { [key: string]: GetSourceUploadInfoApiResponse } = {
    '666': {
      provider: 'azure',
      azure: {
        tenant_id: '2fd7c95c-0d63-4e81-b914-3fbd5288daf7',
        subscription_id: 'dfb83267-e016-4429-ae6e-b0768bf36d65',
        resource_groups: ['myResourceGroup1', 'testResourceGroup'],
      },
    },
    '667': {
      provider: 'azure',
      azure: {
        tenant_id: '73d5694c-7a28-417e-9fca-55840084f508',
        subscription_id: 'a66682d2-ce3e-46f7-a127-1d106c34e10c',
        resource_groups: ['theirGroup2'],
      },
    },
    '123': {
      provider: 'aws',
      aws: {
        account_id: '123456789012',
      },
    },
  };
  return mockInfo[sourceId];
};
