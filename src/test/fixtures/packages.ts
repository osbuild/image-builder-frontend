import {
  ApiRepositoryRpm,
  ApiSearchRpmResponse,
} from '../../store/contentSourcesApi';
import {
  PackagesResponse,
  RecommendPackageApiResponse,
} from '../../store/imageBuilderApi';

export const mockPackagesResults = (search: string): PackagesResponse => {
  if (search === 'te' || search === 'testPkg-123') {
    return mockPkgResultAll;
  } else if (search === 'test') {
    return {
      data: [
        {
          name: 'testPkg',
          summary: 'test package summary',
        },
        {
          name: 'lib-test',
          summary: 'lib-test package summary',
        },
        {
          name: 'test',
          summary: 'summary for test package',
        },
      ],
      links: { first: '', last: '' },
      meta: {
        count: 3,
      },
    };
  } else if (search === 'mock') {
    return {
      data: [
        {
          name: 'mockPkg',
          summary: 'test package summary',
        },
        {
          name: 'lib-mock',
          summary: 'lib-test package summary',
        },
        {
          name: 'mock',
          summary: 'summary for test package',
        },
      ],
      links: { first: '', last: '' },
      meta: {
        count: 3,
      },
    };
  } else {
    return { data: [], links: { first: '', last: '' }, meta: { count: 0 } };
  }
};

export const mockSourcesPackagesResults = (
  search: string
): ApiSearchRpmResponse[] => {
  if (search === 'test') {
    return [
      {
        package_name: 'testPkg-sources',
        summary: 'test package summary',
      },
      {
        package_name: 'lib-test-sources',
        summary: 'lib-test package summary',
      },
      {
        package_name: 'test-sources',
        summary: 'summary for test package',
      },
    ];
  } else {
    return [];
  }
};

export const mockPkgResultAlpha: PackagesResponse = {
  meta: { count: 3 },
  links: { first: '', last: '' },
  data: [
    {
      name: 'lib-test',
      summary: 'lib-test package summary',
    },
    {
      name: 'Z-test',
      summary: 'Z-test package summary',
    },
    {
      name: 'test',
      summary: 'summary for test package',
    },
  ],
};

export const mockPkgResultAlphaContentSources: ApiRepositoryRpm[] = [
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

export const mockPkgResultPartial: PackagesResponse = {
  meta: { count: 132 },
  links: { first: '', last: '' },
  data: new Array(100).fill(undefined).map((_, i) => {
    return {
      name: 'testPkg-' + i,
      summary: 'test package summary',
      version: '1.0',
    };
  }),
};

export const mockPkgResultAll: PackagesResponse = {
  meta: { count: 132 },
  links: { first: '', last: '' },
  data: new Array(132).fill(undefined).map((_, i) => {
    return {
      name: 'testPkg-' + i,
      summary: 'test package summary',
      version: '1.0',
    };
  }),
};

export const mockPkgRecommendations: RecommendPackageApiResponse = {
  packages: [
    'recommendedPackage1',
    'recommendedPackage2',
    'recommendedPackage3',
    'recommendedPackage4',
    'recommendedPackage5',
  ],
};
