import {
  ApiRepositoryRpm,
  ApiRepositoryRpmCollectionResponse,
} from '../../store/contentSourcesApi';
import { PackagesResponse } from '../../store/imageBuilderApi';

export const mockPackagesResults = (search: string): PackagesResponse => {
  if (search === 'test') {
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
  } else {
    return { data: [], links: { first: '', last: '' }, meta: { count: 0 } };
  }
};

export const mockSourcesPackagesResults = (
  search: string
): ApiRepositoryRpm[] => {
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

export const mockPkgResultAll: ApiRepositoryRpmCollectionResponse = {
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
