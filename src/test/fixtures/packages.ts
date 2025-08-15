import {
  ApiRepositoryRpm,
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
} from '../../store/contentSourcesApi';
import { RecommendPackageApiResponse } from '../../store/imageBuilderApi';

export const mockSourcesPackagesResults = (
  search: string,
  urls: string[],
): ApiSearchRpmResponse[] => {
  const isDistroPkgSearch =
    urls.filter((u) => u.includes('cdn.redhat.com')).length > 0;
  if (search === 'te' || search === 'testPkg-123') {
    return mockPkgResultAll;
  }

  if (!isDistroPkgSearch) {
    return [
      {
        package_name: 'test-sources',
        summary: 'summary for test package',
      },
      {
        package_name: 'test-sources-lib',
        summary: 'test-lib package summary',
      },
      {
        package_name: 'testPkg-sources',
        summary: 'test package summary',
      },
    ];
  }

  if (search === 'test') {
    return [
      {
        package_name: 'test',
        summary: 'summary for test package',
      },
      {
        package_name: 'test-lib',
        summary: 'test-lib package summary',
      },
      {
        package_name: 'testPkg',
        summary: 'test package summary',
        package_sources: [
          {
            type: 'package',
          },
        ],
      },
    ];
  }
  if (search === 'testModule') {
    return [
      {
        package_name: 'testModule',
        summary: 'testModule summary',
        package_sources: [
          {
            name: 'testModule',
            type: 'module',
            stream: '1.22',
            end_date: '2025-05-01',
          },
          {
            name: 'testModule',
            type: 'module',
            stream: '1.24',
            end_date: '2027-05-01',
          },
        ],
      },
    ];
  }
  if (search === 'sortingTest') {
    return [
      {
        package_name: 'alphaModule',
        summary: 'Alpha module for sorting tests',
        package_sources: [
          {
            name: 'alphaModule',
            type: 'module',
            stream: '2.0',
            end_date: '2025-12-01',
          },
          {
            name: 'alphaModule',
            type: 'module',
            stream: '3.0',
            end_date: '2027-12-01',
          },
        ],
      },
      {
        package_name: 'betaModule',
        summary: 'Beta module for sorting tests',
        package_sources: [
          {
            name: 'betaModule',
            type: 'module',
            stream: '2.0',
            end_date: '2025-06-01',
          },
          {
            name: 'betaModule',
            type: 'module',
            stream: '4.0',
            end_date: '2028-06-01',
          },
        ],
      },
      {
        package_name: 'gammaModule',
        summary: 'Gamma module for sorting tests',
        package_sources: [
          {
            name: 'gammaModule',
            type: 'module',
            stream: '2.0',
            end_date: '2025-08-01',
          },
          {
            name: 'gammaModule',
            type: 'module',
            stream: '1.5',
            end_date: '2026-08-01',
          },
        ],
      },
    ];
  }
  if (search === 'mock') {
    return [
      {
        package_name: 'mock',
        summary: 'summary for test package',
      },
      {
        package_name: 'mock-lib',
        summary: 'test-lib package summary',
      },
      {
        package_name: 'mockPkg',
        summary: 'test package summary',
      },
    ];
  }
  return [];
};

export const mockSourcesGroupsResults = (
  search: string,
  urls: string[],
): ApiSearchPackageGroupResponse[] => {
  const isDistroPkgSearch =
    urls.filter((u) => u.includes('cdn.redhat.com')).length > 0;
  if (isDistroPkgSearch && search === 'grouper') {
    return [
      {
        description: '',
        id: 'grouper',
        package_group_name: 'Grouper group',
        package_list: ['fish1', 'fish2'],
      },
    ];
  }
  return [];
};

export const mockPkgResultAlphaContentSources: ApiRepositoryRpm[] = [
  {
    name: 'test-lib',
    summary: 'test-lib package summary',
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

export const mockPkgResultPartial: ApiSearchRpmResponse[] = new Array(100)
  .fill(undefined)
  .map((_, i) => {
    return {
      package_name: 'testPkg-' + i,
      summary: 'test package summary',
    };
  });

export const mockPkgResultAll: ApiSearchRpmResponse[] = new Array(132)
  .fill(undefined)
  .map((_, i) => {
    return {
      package_name: 'testPkg-' + i,
      summary: 'test package summary',
    };
  });

export const mockPkgRecommendations: RecommendPackageApiResponse = {
  packages: [
    'recommendedPackage1',
    'recommendedPackage2',
    'recommendedPackage3',
    'recommendedPackage4',
    'recommendedPackage5',
  ],
};
