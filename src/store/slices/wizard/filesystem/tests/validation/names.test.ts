import { describe, expect, it } from 'vitest';

import {
  getDuplicateNames,
  isPartitionNameValid,
} from '@/Components/CreateImageWizard/validators';

import { createLogicalVolume, createVolumeGroup } from '../mocks/filesystem';

describe('filesystem partition name validation', () => {
  it.each(['root', 'data-1', 'vg_data', '+volume', 'disk.1'])(
    'accepts %s',
    (name) => {
      expect(isPartitionNameValid(name)).toBe(true);
    },
  );

  it.each(['', '-root', 'data/name', 'two words'])('rejects %s', (name) => {
    expect(isPartitionNameValid(name)).toBe(false);
  });
});

describe('duplicate volume group names', () => {
  it('returns no duplicates when volume group and logical volume names are unique', () => {
    const volumeGroup = createVolumeGroup([
      createLogicalVolume({ name: 'root' }),
      createLogicalVolume({ name: 'home' }),
    ]);

    expect(getDuplicateNames(volumeGroup)).toEqual([]);
  });

  it('finds duplicates against the volume group name and prior logical volumes', () => {
    const volumeGroup = createVolumeGroup(
      [
        createLogicalVolume({ name: 'vg0' }),
        createLogicalVolume({ name: 'home' }),
        createLogicalVolume({ name: 'home' }),
      ],
      { name: 'vg0' },
    );

    expect(getDuplicateNames(volumeGroup)).toEqual(['vg0', 'home']);
  });
});
