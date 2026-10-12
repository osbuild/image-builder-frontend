import { describe, expect, it } from 'vitest';

import { validateFilesystemSlice } from '@/store/slices/wizard';

import { createLogicalVolume, createVolumeGroup } from '../mocks/filesystem';

const validateNames = (volumeGroupName: string, logicalVolumeNames: string[]) =>
  validateFilesystemSlice(
    {
      mode: 'advanced',
      disk: {
        unit: 'GiB',
        partitions: [
          createVolumeGroup(
            logicalVolumeNames.map((name, index) =>
              createLogicalVolume({ name, mountpoint: `/var/test-${index}` }),
            ),
            { name: volumeGroupName },
          ),
        ],
      },
    },
    'image',
  );

const getIssueDetails = (
  errors: ReturnType<typeof validateFilesystemSlice>['errors'],
) => errors.map(({ message, path }) => ({ message, path }));

describe('filesystem partition name validation', () => {
  it.each(['root', 'data-1', 'vg_data', '+volume', 'disk.1'])(
    'accepts %s',
    (name) => {
      expect(validateNames('vg0', [name]).errors).toEqual([]);
    },
  );

  it.each(['', '-root', 'data/name', 'two words'])('rejects %s', (name) => {
    expect(getIssueDetails(validateNames('vg0', [name]).errors)).toEqual([
      {
        message: 'Invalid partition name',
        path: ['disk', 'partitions', 0, 'logical_volumes', 0, 'name'],
      },
    ]);
  });
});

describe('volume group and logical volume names', () => {
  it('returns no errors when volume group and logical volume names are unique', () => {
    expect(validateNames('vg0', ['root', 'home']).errors).toEqual([]);
  });

  it('reports a logical volume matching its volume group separately from duplicate LVs', () => {
    const result = validateNames('vg0', ['vg0', 'home', 'home']);

    expect(getIssueDetails(result.errors)).toEqual([
      {
        message: 'Duplicate logical volumes: home',
        path: ['disk', 'partitions', 0, 'logical_volumes', 2, 'name'],
      },
      {
        message:
          'A logical volume must have a different name from its volume group',
        path: ['disk', 'partitions', 0, 'logical_volumes', 0, 'name'],
      },
    ]);
  });
});
