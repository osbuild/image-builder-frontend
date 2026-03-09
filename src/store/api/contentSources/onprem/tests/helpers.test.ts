import { describe, expect, it } from 'vitest';

import {
  createMockPackage,
  mockDuplicatePackages,
  mockPackages,
} from './mocks';

import {
  deduplicatePackages,
  mapPackageToSearchResult,
  transformPackageResponse,
} from '../helpers';

describe('mapPackageToSearchResult', () => {
  it('should map package name to package_name', () => {
    const pkg = createMockPackage({ name: 'vim' });
    const result = mapPackageToSearchResult(pkg);

    expect(result.package_name).toBe('vim');
  });

  it('should format summary with version, release, and arch', () => {
    const pkg = createMockPackage({
      summary: 'Vi Improved text editor',
      version: '8.2',
      release: '1.el9',
      arch: 'x86_64',
    });
    const result = mapPackageToSearchResult(pkg);

    expect(result.summary).toBe('Vi Improved text editor (8.2-1.el9.x86_64)');
  });

  it('should handle empty summary with descriptive fallback', () => {
    const pkg = createMockPackage({
      summary: '',
      version: '1.0',
      release: '1',
      arch: 'noarch',
    });
    const result = mapPackageToSearchResult(pkg);

    expect(result.summary).toBe('Version 1.0-1.noarch');
  });

  it('should handle packages with missing optional fields gracefully', () => {
    const pkg = {
      name: 'partial-pkg',
      arch: 'x86_64',
      summary: '',
      version: undefined as unknown as string,
      release: undefined as unknown as string,
    };
    const result = mapPackageToSearchResult(pkg);

    // The function will produce a string with undefined values
    // This documents current behavior for malformed data
    expect(result.package_name).toBe('partial-pkg');
    expect(result.summary).toBe('Version undefined-undefined.x86_64');
  });

  it('should handle package names with special characters', () => {
    const pkg = createMockPackage({ name: 'glibc-langpack-en_US.UTF-8' });
    const result = mapPackageToSearchResult(pkg);

    expect(result.package_name).toBe('glibc-langpack-en_US.UTF-8');
  });

  it('should handle summaries with emojis', () => {
    const pkg = createMockPackage({
      name: 'emoji-pkg',
      summary: 'A package with emojis 🎉🚀',
      version: '1.0',
      release: '1',
      arch: 'noarch',
    });
    const result = mapPackageToSearchResult(pkg);

    expect(result.package_name).toBe('emoji-pkg');
    expect(result.summary).toBe('A package with emojis 🎉🚀 (1.0-1.noarch)');
  });

  it('should handle unicode characters in summary', () => {
    const pkg = createMockPackage({
      name: 'i18n-pkg',
      summary: 'Ünïcödé chäräctérs àñd symbols ©®™',
      version: '2.0',
      release: '1.el9',
      arch: 'x86_64',
    });
    const result = mapPackageToSearchResult(pkg);

    expect(result.summary).toBe(
      'Ünïcödé chäräctérs àñd symbols ©®™ (2.0-1.el9.x86_64)',
    );
  });
});

describe('mapPackageToSearchResult with multiple packages', () => {
  it('should map multiple packages', () => {
    const results = mockPackages.map(mapPackageToSearchResult);

    expect(results).toHaveLength(3);
    expect(results[0].package_name).toBe('vim');
    expect(results[1].package_name).toBe('git');
    expect(results[2].package_name).toBe('curl');
  });

  it('should return empty array for empty input', () => {
    const results = [].map(mapPackageToSearchResult);

    expect(results).toHaveLength(0);
  });
});

describe('deduplicatePackages', () => {
  it('should remove duplicate packages by name', () => {
    const mapped = mockDuplicatePackages.map(mapPackageToSearchResult);
    const results = deduplicatePackages(mapped);

    expect(results).toHaveLength(2);
    expect(results.map((p) => p.package_name)).toEqual(['vim', 'git']);
  });

  it('should keep first occurrence when duplicates exist', () => {
    const mapped = mockDuplicatePackages.map(mapPackageToSearchResult);
    const results = deduplicatePackages(mapped);

    const vimPackage = results.find((p) => p.package_name === 'vim');
    expect(vimPackage?.summary).toContain('1.el9');
  });

  it('should return all packages when no duplicates', () => {
    const mapped = mockPackages.map(mapPackageToSearchResult);
    const results = deduplicatePackages(mapped);

    expect(results).toHaveLength(3);
  });

  it('should handle empty array', () => {
    const results = deduplicatePackages([]);

    expect(results).toHaveLength(0);
  });

  it('should treat package names as case-sensitive', () => {
    const packages = [
      { package_name: 'vim', summary: 'Vi Improved' },
      { package_name: 'VIM', summary: 'Vi Improved uppercase' },
      { package_name: 'Vim', summary: 'Vi Improved titlecase' },
    ];
    const results = deduplicatePackages(packages);

    expect(results).toHaveLength(3);
    expect(results.map((p) => p.package_name)).toEqual(['vim', 'VIM', 'Vim']);
  });
});

describe('transformPackageResponse', () => {
  it('should transform and deduplicate packages', () => {
    const results = transformPackageResponse(mockDuplicatePackages);

    expect(results).toHaveLength(2);
    expect(results[0].package_name).toBe('vim');
    expect(results[1].package_name).toBe('git');
  });

  it('should return empty array for undefined input', () => {
    const results = transformPackageResponse(undefined);

    expect(results).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const results = transformPackageResponse([]);

    expect(results).toHaveLength(0);
  });

  it('should format summary correctly for all packages', () => {
    const results = transformPackageResponse(mockPackages);

    expect(results[0].summary).toBe(
      'Vi Improved text editor (8.2-1.el9.x86_64)',
    );
    expect(results[1].summary).toBe(
      'Fast distributed version control (2.39-3.el9.x86_64)',
    );
    expect(results[2].summary).toBe(
      'Command line tool for transferring data (7.76-14.el9.x86_64)',
    );
  });
});
