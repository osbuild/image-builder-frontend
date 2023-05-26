export const mockPackagesResults = (search) => {
  if (search === 'test') {
    return {
      data: [
        {
          name: 'testPkg',
          summary: 'test package summary',
          version: '1.0',
        },
        {
          name: 'lib-test',
          summary: 'lib-test package summary',
          version: '1.0',
        },
        {
          name: 'test',
          summary: 'summary for test package',
          version: '1.0',
        },
      ],
      meta: {
        count: 3,
      },
    };
  } else {
    return { data: [], meta: 0 };
  }
};

export const mockSourcesPackagesResults = (search) => {
  if (search === 'test') {
    return [
      {
        name: 'testPkg',
        summary: 'test package summary',
        version: '1.0',
      },
      {
        name: 'lib-test',
        summary: 'lib-test package summary',
        version: '1.0',
      },
      {
        name: 'test',
        summary: 'summary for test package',
        version: '1.0',
      },
    ];
  } else {
    return [];
  }
};

export const mockPkgResultAlpha = {
  meta: { count: 3 },
  links: { first: '', last: '' },
  data: [
    {
      name: 'lib-test',
      summary: 'lib-test package summary',
      version: '1.0',
    },
    {
      name: 'Z-test',
      summary: 'Z-test package summary',
      version: '1.0',
    },
    {
      name: 'test',
      summary: 'summary for test package',
      version: '1.0',
    },
  ],
};

export const mockPkgResultAlphaContentSources = [
  {
    name: 'lib-test',
    summary: 'lib-test package summary',
    version: '1.0',
  },
  {
    name: 'Z-test',
    summary: 'Z-test package summary',
    version: '1.0',
  },
  {
    name: 'test',
    summary: 'summary for test package',
    version: '1.0',
  },
];

export const mockPkgResultPartial = {
  meta: { count: 132 },
  links: { first: '', last: '' },
  data: new Array(100).fill().map((_, i) => {
    return {
      name: 'testPkg-' + i,
      summary: 'test package summary',
      version: '1.0',
    };
  }),
};

export const mockPkgResultAll = {
  meta: { count: 132 },
  links: { first: '', last: '' },
  data: new Array(132).fill().map((_, i) => {
    return {
      name: 'testPkg-' + i,
      summary: 'test package summary',
      version: '1.0',
    };
  }),
};
