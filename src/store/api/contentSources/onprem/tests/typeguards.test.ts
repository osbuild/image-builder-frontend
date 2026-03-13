import { describe, expect, it } from 'vitest';

import { OnPremApiError } from '@/store/api/shared';

import { assertPackagesResponse, isPackagesResponse } from '../typeguards';

describe('isPackagesResponse', () => {
  it('should return true for an object with a valid packages array', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          arch: 'x86_64',
          version: '8.2',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(true);
  });

  it('should return true for an object with an empty packages array', () => {
    expect(isPackagesResponse({ packages: [] })).toBe(true);
  });

  it('should return true when packages key is absent', () => {
    expect(isPackagesResponse({})).toBe(true);
  });

  it('should return true when packages is undefined', () => {
    expect(isPackagesResponse({ packages: undefined })).toBe(true);
  });

  it('should return false when packages is not an array', () => {
    expect(isPackagesResponse({ packages: 'not-an-array' })).toBe(false);
  });

  it('should return false when a package is missing name', () => {
    const value = {
      packages: [
        {
          summary: 'No name',
          arch: 'x86_64',
          version: '8.2',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package is missing summary', () => {
    const value = {
      packages: [
        { name: 'vim', arch: 'x86_64', version: '8.2', release: '1.el9' },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package is missing arch', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          version: '8.2',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package is missing version', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          arch: 'x86_64',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package is missing release', () => {
    const value = {
      packages: [
        { name: 'vim', summary: 'Text editor', arch: 'x86_64', version: '8.2' },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package name is not a string', () => {
    const value = {
      packages: [
        {
          name: 123,
          summary: 'test',
          arch: 'x86_64',
          version: '8.2',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package arch is not a string', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          arch: 64,
          version: '8.2',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package version is not a string', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          arch: 'x86_64',
          version: 8.2,
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false when a package release is not a string', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          arch: 'x86_64',
          version: '8.2',
          release: 1,
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isPackagesResponse(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPackagesResponse(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isPackagesResponse('not-an-object')).toBe(false);
  });

  it('should validate all packages in the array', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Valid',
          arch: 'x86_64',
          version: '8.2',
          release: '1.el9',
        },
        {
          name: 123,
          summary: 'Invalid name type',
          arch: 'x86_64',
          version: '8.2',
          release: '1.el9',
        },
      ],
    };

    expect(isPackagesResponse(value)).toBe(false);
  });
});

describe('assertPackagesResponse', () => {
  it('should return the value for a valid packages response', () => {
    const value = {
      packages: [
        {
          name: 'vim',
          summary: 'Text editor',
          arch: 'x86_64',
          version: '8.2',
          release: '1.el9',
        },
      ],
    };
    const result = assertPackagesResponse(value);

    expect(result).toBe(value);
  });

  it('should return the value when packages is absent', () => {
    const value = {};
    const result = assertPackagesResponse(value);

    expect(result).toBe(value);
  });

  it('should throw OnPremApiError for invalid data', () => {
    expect(() => assertPackagesResponse(null)).toThrow(OnPremApiError);
  });

  it('should throw with a user-friendly message', () => {
    expect(() => assertPackagesResponse('invalid')).toThrow(
      'Package search returned an unexpected response',
    );
  });
});
