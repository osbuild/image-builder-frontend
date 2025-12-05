import { describe, expect, it } from 'vitest';

import {
  DiskPartition,
  FilesystemPartition,
} from '../../../../../Components/CreateImageWizard/steps/FileSystem/fscTypes';
import {
  calculateTotalDiskSize,
  calculateTotalFilesystemSize,
  parseMinDiskSize,
} from '../../../../../Components/CreateImageWizard/steps/FileSystem/fscUtilities';
import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../../../constants';

describe('fscUtilities size calculation functions', () => {
  describe('calculateTotalFilesystemSize', () => {
    it('should return 0 for empty array', () => {
      const partitions: FilesystemPartition[] = [];
      expect(calculateTotalFilesystemSize(partitions)).toBe(0);
    });

    it('should calculate size for single partition in bytes', () => {
      const partitions: FilesystemPartition[] = [
        {
          id: '1',
          mountpoint: '/',
          min_size: '1024',
          unit: 'B',
        },
      ];
      expect(calculateTotalFilesystemSize(partitions)).toBe(1024);
    });

    it('should calculate size for single partition in KiB', () => {
      const partitions: FilesystemPartition[] = [
        {
          id: '1',
          mountpoint: '/',
          min_size: '10',
          unit: 'KiB',
        },
      ];
      expect(calculateTotalFilesystemSize(partitions)).toBe(10 * UNIT_KIB);
    });

    it('should calculate size for single partition in MiB', () => {
      const partitions: FilesystemPartition[] = [
        {
          id: '1',
          mountpoint: '/',
          min_size: '100',
          unit: 'MiB',
        },
      ];
      expect(calculateTotalFilesystemSize(partitions)).toBe(100 * UNIT_MIB);
    });

    it('should calculate size for single partition in GiB', () => {
      const partitions: FilesystemPartition[] = [
        {
          id: '1',
          mountpoint: '/',
          min_size: '10',
          unit: 'GiB',
        },
      ];
      expect(calculateTotalFilesystemSize(partitions)).toBe(10 * UNIT_GIB);
    });

    it('should calculate total size for multiple partitions with different units', () => {
      const partitions: FilesystemPartition[] = [
        {
          id: '1',
          mountpoint: '/',
          min_size: '10',
          unit: 'GiB',
        },
        {
          id: '2',
          mountpoint: '/home',
          min_size: '500',
          unit: 'MiB',
        },
        {
          id: '3',
          mountpoint: '/boot',
          min_size: '1024',
          unit: 'KiB',
        },
        {
          id: '4',
          mountpoint: '/tmp',
          min_size: '2048',
          unit: 'B',
        },
      ];

      const expected = 10 * UNIT_GIB + 500 * UNIT_MIB + 1024 * UNIT_KIB + 2048;
      expect(calculateTotalFilesystemSize(partitions)).toBe(expected);
    });

    it('should handle multiple partitions in same unit', () => {
      const partitions: FilesystemPartition[] = [
        {
          id: '1',
          mountpoint: '/',
          min_size: '20',
          unit: 'GiB',
        },
        {
          id: '2',
          mountpoint: '/home',
          min_size: '50',
          unit: 'GiB',
        },
        {
          id: '3',
          mountpoint: '/var',
          min_size: '30',
          unit: 'GiB',
        },
      ];

      const expected = 100 * UNIT_GIB;
      expect(calculateTotalFilesystemSize(partitions)).toBe(expected);
    });
  });

  describe('parseMinDiskSize', () => {
    it('should return 0 for empty string', () => {
      expect(parseMinDiskSize('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
      expect(parseMinDiskSize('   ')).toBe(0);
    });

    it('should parse size in bytes', () => {
      expect(parseMinDiskSize('1024 B')).toBe(1024);
    });

    it('should parse size in KiB', () => {
      expect(parseMinDiskSize('10 KiB')).toBe(10 * UNIT_KIB);
    });

    it('should parse size in MiB', () => {
      expect(parseMinDiskSize('100 MiB')).toBe(100 * UNIT_MIB);
    });

    it('should parse size in GiB', () => {
      expect(parseMinDiskSize('50 GiB')).toBe(50 * UNIT_GIB);
    });

    it('should normalize GB to GiB', () => {
      expect(parseMinDiskSize('10 GB')).toBe(10 * UNIT_GIB);
    });

    it('should handle number-only string and assume GiB', () => {
      expect(parseMinDiskSize('20')).toBe(20 * UNIT_GIB);
    });

    it('should handle extra whitespace between number and unit', () => {
      expect(parseMinDiskSize('15   GiB')).toBe(15 * UNIT_GIB);
    });

    it('should handle leading and trailing whitespace', () => {
      expect(parseMinDiskSize('  25 GiB  ')).toBe(25 * UNIT_GIB);
    });

    it('should return 0 for invalid format', () => {
      expect(parseMinDiskSize('invalid')).toBe(0);
    });

    it('should fallback to GiB for unsupported unit (parses number only)', () => {
      // When unit is not recognized, it falls back to parsing as raw number and assumes GiB
      expect(parseMinDiskSize('10 TB')).toBe(10 * UNIT_GIB);
    });

    it('should handle string with only unit', () => {
      expect(parseMinDiskSize('GiB')).toBe(0);
    });

    it('should parse multiple space-separated parts (takes first two)', () => {
      expect(parseMinDiskSize('30 GiB extra text')).toBe(30 * UNIT_GIB);
    });
  });

  describe('calculateTotalDiskSize', () => {
    it('should return 0 for empty partitions and no minDiskSize', () => {
      const partitions: DiskPartition[] = [];
      expect(calculateTotalDiskSize(partitions)).toBe(0);
    });

    it('should calculate size for single plain partition', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/',
          min_size: '10',
          unit: 'GiB',
        },
      ];
      expect(calculateTotalDiskSize(partitions)).toBe(10 * UNIT_GIB);
    });

    it('should calculate size for multiple plain partitions', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/',
          min_size: '20',
          unit: 'GiB',
        },
        {
          id: '2',
          type: 'plain',
          mountpoint: '/home',
          min_size: '500',
          unit: 'MiB',
        },
      ];

      const expected = 20 * UNIT_GIB + 500 * UNIT_MIB;
      expect(calculateTotalDiskSize(partitions)).toBe(expected);
    });

    it('should calculate size for LVM volume group with logical volumes', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'lvm',
          name: 'vg0',
          min_size: undefined,
          unit: undefined,
          logical_volumes: [
            {
              id: '2',
              mountpoint: '/',
              min_size: '10',
              unit: 'GiB',
            },
            {
              id: '3',
              mountpoint: '/home',
              min_size: '20',
              unit: 'GiB',
            },
          ],
        },
      ];

      const expected = 30 * UNIT_GIB;
      expect(calculateTotalDiskSize(partitions)).toBe(expected);
    });

    it('should calculate size for mixed plain and LVM partitions', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/boot',
          min_size: '1',
          unit: 'GiB',
        },
        {
          id: '2',
          type: 'lvm',
          name: 'vg0',
          min_size: undefined,
          unit: undefined,
          logical_volumes: [
            {
              id: '3',
              mountpoint: '/',
              min_size: '15',
              unit: 'GiB',
            },
            {
              id: '4',
              mountpoint: '/var',
              min_size: '10',
              unit: 'GiB',
            },
          ],
        },
      ];

      const expected = 1 * UNIT_GIB + 15 * UNIT_GIB + 10 * UNIT_GIB;
      expect(calculateTotalDiskSize(partitions)).toBe(expected);
    });

    it('should handle partitions with missing min_size', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/',
          min_size: undefined,
          unit: 'GiB',
        },
        {
          id: '2',
          type: 'plain',
          mountpoint: '/home',
          min_size: '10',
          unit: 'GiB',
        },
      ];

      expect(calculateTotalDiskSize(partitions)).toBe(10 * UNIT_GIB);
    });

    it('should handle LVM with missing min_size on logical volumes', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'lvm',
          name: 'vg0',
          min_size: undefined,
          unit: undefined,
          logical_volumes: [
            {
              id: '2',
              mountpoint: '/',
              min_size: undefined,
              unit: 'GiB',
            },
            {
              id: '3',
              mountpoint: '/home',
              min_size: '20',
              unit: 'GiB',
            },
          ],
        },
      ];

      expect(calculateTotalDiskSize(partitions)).toBe(20 * UNIT_GIB);
    });

    it('should use minDiskSize when provided and larger than partitions total', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/',
          min_size: '10',
          unit: 'GiB',
        },
      ];

      expect(calculateTotalDiskSize(partitions, '50 GiB')).toBe(50 * UNIT_GIB);
    });

    it('should use partitions total when larger than minDiskSize', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/',
          min_size: '100',
          unit: 'GiB',
        },
      ];

      expect(calculateTotalDiskSize(partitions, '10 GiB')).toBe(100 * UNIT_GIB);
    });

    it('should ignore minDiskSize when empty', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/',
          min_size: '25',
          unit: 'GiB',
        },
      ];

      expect(calculateTotalDiskSize(partitions, '')).toBe(25 * UNIT_GIB);
    });

    it('should handle complex scenario with multiple LVM groups', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'plain',
          mountpoint: '/boot',
          min_size: '1',
          unit: 'GiB',
        },
        {
          id: '2',
          type: 'lvm',
          name: 'vg0',
          min_size: undefined,
          unit: undefined,
          logical_volumes: [
            {
              id: '3',
              mountpoint: '/',
              min_size: '20',
              unit: 'GiB',
            },
            {
              id: '4',
              mountpoint: '/var',
              min_size: '15',
              unit: 'GiB',
            },
          ],
        },
        {
          id: '5',
          type: 'lvm',
          name: 'vg1',
          min_size: undefined,
          unit: undefined,
          logical_volumes: [
            {
              id: '6',
              mountpoint: '/home',
              min_size: '50',
              unit: 'GiB',
            },
          ],
        },
      ];

      const expected =
        1 * UNIT_GIB + 20 * UNIT_GIB + 15 * UNIT_GIB + 50 * UNIT_GIB;
      expect(calculateTotalDiskSize(partitions)).toBe(expected);
    });

    it('should handle LVM with default unit when unit is undefined', () => {
      const partitions: DiskPartition[] = [
        {
          id: '1',
          type: 'lvm',
          name: 'vg0',
          min_size: undefined,
          unit: undefined,
          logical_volumes: [
            {
              id: '2',
              mountpoint: '/',
              min_size: '10',
              unit: undefined,
            },
          ],
        },
      ];

      // When unit is undefined, it defaults to GiB
      expect(calculateTotalDiskSize(partitions)).toBe(10 * UNIT_GIB);
    });

    it('should return minDiskSize when partitions are empty', () => {
      const partitions: DiskPartition[] = [];
      expect(calculateTotalDiskSize(partitions, '100 GiB')).toBe(
        100 * UNIT_GIB,
      );
    });
  });
});
