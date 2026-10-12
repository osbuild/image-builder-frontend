import { describe, expect, it } from 'vitest';

import { UNIT_GIB } from '@/constants';
import {
  type DiskPartition,
  validateFilesystemSlice,
} from '@/store/slices/wizard';

import {
  createBasicPartition,
  createLogicalVolume,
  createPlainPartition,
  createVolumeGroup,
} from '../mocks/filesystem';

const validateBasicMinSize = (min_size: string) =>
  validateFilesystemSlice(
    {
      mode: 'basic',
      filesystem: {
        partitions: [
          createBasicPartition({ id: 'root', mountpoint: '/', min_size }),
        ],
      },
    },
    'image',
  );

const validateAdvancedMinSize = (partition: DiskPartition) =>
  validateFilesystemSlice(
    {
      mode: 'advanced',
      disk: { minsize: '', unit: 'GiB', partitions: [partition] },
    },
    'image',
  );

const validateDiskMinSize = (minsize: string) =>
  validateFilesystemSlice(
    {
      mode: 'advanced',
      disk: { minsize, unit: 'GiB', partitions: [] },
    },
    'image',
  );

const validateBasicMinSizeAgainstRequirement = (min_size: string) =>
  validateFilesystemSlice(
    {
      mode: 'basic',
      filesystem: {
        partitions: [
          createBasicPartition({ id: 'root', mountpoint: '/', min_size }),
        ],
      },
    },
    'package',
    [{ mountpoint: '/', min_size: 10 * UNIT_GIB }],
  );

const getIssueDetails = (
  errors: ReturnType<typeof validateFilesystemSlice>['errors'],
) => errors.map(({ message, path }) => ({ message, path }));

describe('filesystem size validation', () => {
  describe('mountpoint minimum size', () => {
    it.each(['1', '10', '001'])('accepts positive integer %s', (size) => {
      expect(validateBasicMinSize(size).errors).toEqual([]);
    });

    it('reports an empty value as a required size', () => {
      expect(getIssueDetails(validateBasicMinSize('').errors)).toContainEqual({
        message: 'Partition size is required',
        path: ['filesystem', 'partitions', 0, 'min_size'],
      });
    });

    it.each([
      ['0', 'Minsize should be positive and non-zero'],
      ['-1', 'Minsize should be a numeric value only'],
      ['1.5', 'Minsize should be a numeric value only'],
      [' 1', 'Minsize should be a numeric value only'],
    ])('rejects invalid size %s', (size, message) => {
      expect(getIssueDetails(validateBasicMinSize(size).errors)).toEqual([
        {
          message,
          path: ['filesystem', 'partitions', 0, 'min_size'],
        },
      ]);
    });
  });

  describe('selected filesystem minimum size', () => {
    it('rejects an untouched partition below the selected minimum', () => {
      expect(
        getIssueDetails(validateBasicMinSizeAgainstRequirement('5').errors),
      ).toEqual([
        {
          message: 'Minimum size must be at least 10 GiB',
          path: ['filesystem', 'partitions', 0, 'min_size'],
        },
      ]);
    });

    it('accepts a partition at the selected minimum', () => {
      expect(validateBasicMinSizeAgainstRequirement('10').errors).toEqual([]);
    });
  });

  describe('advanced partition minimum size', () => {
    it('requires a size for plain partitions', () => {
      expect(
        getIssueDetails(
          validateAdvancedMinSize(createPlainPartition({ min_size: '' }))
            .errors,
        ),
      ).toContainEqual({
        message: 'Partition size is required',
        path: ['disk', 'partitions', 0, 'min_size'],
      });
    });

    it('requires a size for volume groups', () => {
      expect(
        getIssueDetails(
          validateAdvancedMinSize(createVolumeGroup([], { min_size: '' }))
            .errors,
        ),
      ).toContainEqual({
        message: 'Partition size is required',
        path: ['disk', 'partitions', 0, 'min_size'],
      });
    });

    it('requires a size for logical volumes', () => {
      expect(
        getIssueDetails(
          validateAdvancedMinSize(
            createVolumeGroup([createLogicalVolume({ min_size: '' })]),
          ).errors,
        ),
      ).toContainEqual({
        message: 'Partition size is required',
        path: ['disk', 'partitions', 0, 'logical_volumes', 0, 'min_size'],
      });
    });
  });

  describe('disk minimum size', () => {
    it.each(['0', '10', '001'])('accepts non-negative integer %s', (size) => {
      expect(validateDiskMinSize(size).errors).toEqual([]);
    });

    it('allows an empty value when no disk minimum is set', () => {
      expect(validateDiskMinSize('').errors).toEqual([]);
    });

    it.each(['-1', '1.5', ' 1'])('rejects invalid size %s', (size) => {
      expect(getIssueDetails(validateDiskMinSize(size).errors)).toEqual([
        {
          message: 'Minsize should be a numeric value only',
          path: ['disk', 'minsize'],
        },
      ]);
    });
  });
});
