export const mockActivationKeysResults = () => {
  return {
    body: [
      {
        id: 0,
        name: 'name0',
      },
      {
        id: 1,
        name: 'name1',
      },
    ],
  };
};

export const mockActivationKeyInformation = (key) => {
  if (key === 'name0') {
    return {
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
    };
  } else if (key === 'name1') {
    return {
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
    };
  }
};
