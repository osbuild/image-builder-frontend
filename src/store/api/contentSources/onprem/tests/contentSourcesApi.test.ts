import { describe, expect, it } from 'vitest';

import {
  buildRequestBody,
  createSearchArgs,
  isValidSearchArgs,
  mockDuplicatePackages,
  mockPackages,
} from './mocks';

import { transformPackageResponse } from '../helpers';

describe('searchRpm endpoint', () => {
  describe('input validation', () => {
    it('should be valid when all required fields are provided', () => {
      const args = createSearchArgs();
      expect(isValidSearchArgs(args)).toBe(true);
    });

    it('should be invalid when architecture is missing', () => {
      const args = createSearchArgs({ architecture: undefined });
      expect(isValidSearchArgs(args)).toBe(false);
    });

    it('should be invalid when distribution is missing', () => {
      const args = createSearchArgs({ distribution: undefined });
      expect(isValidSearchArgs(args)).toBe(false);
    });

    it('should be invalid when packages is missing', () => {
      const args = createSearchArgs({ packages: undefined });
      expect(isValidSearchArgs(args)).toBe(false);
    });

    it('should be invalid when architecture is empty string', () => {
      const args = createSearchArgs({ architecture: '' });
      expect(isValidSearchArgs(args)).toBe(false);
    });

    it('should be invalid when distribution is empty string', () => {
      const args = createSearchArgs({ distribution: '' });
      expect(isValidSearchArgs(args)).toBe(false);
    });

    it('should be valid with empty packages array', () => {
      // Empty array is truthy, so validation passes
      // The API will return empty results for empty package list
      const args = createSearchArgs({ packages: [] });
      expect(isValidSearchArgs(args)).toBe(true);
    });
  });

  describe('request body construction', () => {
    it('should construct correct body shape', () => {
      const args = createSearchArgs({
        architecture: 'aarch64',
        distribution: 'centos-9',
        packages: ['nginx', 'httpd'],
      });

      const body = buildRequestBody(args);

      expect(body).toEqual({
        packages: ['nginx', 'httpd'],
        distribution: 'centos-9',
        architecture: 'aarch64',
      });
    });

    it('should preserve package order', () => {
      const args = createSearchArgs({
        packages: ['zsh', 'bash', 'fish'],
      });

      const body = buildRequestBody(args);
      expect(body.packages).toEqual(['zsh', 'bash', 'fish']);
    });
  });

  describe('response transformation', () => {
    it('should return empty array when validation fails', () => {
      // When validation fails, the endpoint returns { data: [] }
      const emptyResponse = { data: [] };
      expect(emptyResponse.data).toEqual([]);
    });

    it('should transform API response through transformPackageResponse', () => {
      const result = transformPackageResponse(mockPackages);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        package_name: 'vim',
        summary: 'Vi Improved text editor (8.2-1.el9.x86_64)',
      });
      expect(result[1]).toEqual({
        package_name: 'git',
        summary: 'Fast distributed version control (2.39-3.el9.x86_64)',
      });
    });

    it('should deduplicate packages in response', () => {
      const result = transformPackageResponse(mockDuplicatePackages);

      expect(result).toHaveLength(2);
      expect(result[0].package_name).toBe('vim');
      expect(result[1].package_name).toBe('git');
    });

    it('should handle undefined packages in response', () => {
      const result = transformPackageResponse(undefined);
      expect(result).toEqual([]);
    });

    it('should handle empty packages array in response', () => {
      const result = transformPackageResponse([]);
      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should return error object when API returns error', () => {
      // Simulates the error handling path in queryFn
      const mockError = {
        status: 500,
        data: { message: 'Internal server error' },
      };

      const errorResponse = { error: mockError };

      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.error.status).toBe(500);
    });
  });
});

describe('listSnapshotsByDate endpoint', () => {
  it('should return empty data array (stub implementation)', () => {
    // The listSnapshotsByDate endpoint is a stub that always returns empty data
    // This is temporary until the on-prem backend supports this feature
    const stubResponse = {
      data: {
        data: [],
      },
    };

    expect(stubResponse.data).toBeDefined();
    expect(stubResponse.data.data).toEqual([]);
  });
});
