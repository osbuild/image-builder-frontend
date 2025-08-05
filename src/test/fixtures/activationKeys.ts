import {
  ListActivationKeysApiResponse,
  ShowActivationKeyApiResponse,
} from '../../store/rhsmApi';

export const mockActivationKeysResults = (): ListActivationKeysApiResponse => {
  return {
    body: [
      {
        id: '0',
        name: 'name0',
      },
      {
        id: '1',
        name: 'name1',
      },
    ],
  };
};

export const mockActivationKeyInformation = (
  key: string,
): ShowActivationKeyApiResponse => {
  const mockKeys: { [key: string]: ShowActivationKeyApiResponse } = {
    name0: {
      body: {
        additionalRepositories: [
          {
            repositoryLabel: 'repository0',
          },
          {
            repositoryLabel: 'repository1',
          },
          {
            repositoryLabel: 'repository2',
          },
        ],
        id: '0',
        name: 'name0',
        releaseVersion: '',
        role: '',
        serviceLevel: 'Self-Support',
        usage: 'Production',
      },
    },
    name1: {
      body: {
        additionalRepositories: [
          {
            repositoryLabel: 'repository3',
          },
          {
            repositoryLabel: 'repository4',
          },
          {
            repositoryLabel: 'repository5',
          },
        ],
        id: '1',
        name: 'name1',
        releaseVersion: '',
        role: '',
        serviceLevel: 'Premium',
        usage: 'Production',
      },
    },
  };
  return mockKeys[key];
};
