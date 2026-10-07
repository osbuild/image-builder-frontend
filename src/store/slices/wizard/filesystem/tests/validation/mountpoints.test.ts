import { describe, expect, it } from 'vitest';

import {
  getDuplicateMountPoints,
  getInvalidMountpoints,
  isMountpointValid,
} from '@/Components/CreateImageWizard/validators';

import {
  createBasicPartition,
  createLogicalVolume,
  createPlainPartition,
  createVolumeGroup,
} from '../mocks/filesystem';

describe('filesystem mountpoint validation', () => {
  describe('mountpoint policies', () => {
    it('allows package mountpoints except denied paths', () => {
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/home' }),
          'package',
        ),
      ).toBe(true);
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/etc/passwd' }),
          'package',
        ),
      ).toBe(false);
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/usr/local' }),
          'package',
        ),
      ).toBe(false);
    });

    it('allows image-mode mountpoints under permitted paths', () => {
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/boot/' }),
          'image',
        ),
      ).toBe(true);
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/var/log' }),
          'image',
        ),
      ).toBe(true);
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/boot/efi' }),
          'image',
        ),
      ).toBe(false);
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/var/home' }),
          'image',
        ),
      ).toBe(false);
      expect(
        isMountpointValid(
          createBasicPartition({ mountpoint: '/home' }),
          'image',
        ),
      ).toBe(false);
    });
  });

  it('finds duplicate mountpoints across disk partitions and logical volumes', () => {
    const partitions = [
      createPlainPartition({ mountpoint: '/data' }),
      createVolumeGroup([
        createLogicalVolume({ mountpoint: '/data' }),
        createLogicalVolume({ mountpoint: '/data' }),
      ]),
    ];

    expect(getDuplicateMountPoints(partitions)).toEqual(['/data', '/data']);
  });

  it('collects invalid mountpoints from disk partitions and logical volumes', () => {
    const partitions = [
      createPlainPartition({ mountpoint: '/proc' }),
      createVolumeGroup([
        createLogicalVolume({ mountpoint: '/sys' }),
        createLogicalVolume({ mountpoint: '/home' }),
      ]),
    ];

    expect(getInvalidMountpoints(partitions, 'package')).toEqual([
      '/proc',
      '/sys',
    ]);
  });
});
