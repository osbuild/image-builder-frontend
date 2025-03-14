import {
  ApiRepositoryRpm,
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
} from '../../store/contentSourcesApi';
import { RecommendPackageApiResponse } from '../../store/imageBuilderApi';

export const mockSourcesPackagesResults = (
  search: string,
  urls: string[]
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
  urls: string[]
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
