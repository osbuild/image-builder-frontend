import { describe, expect, it } from 'vitest';

import { validateFilesystemSlice } from '@/store/slices/wizard';

import {
  createBasicPartition,
  createLogicalVolume,
  createPlainPartition,
  createVolumeGroup,
} from '../mocks/filesystem';

const validateBasicMountpoint = (
  mountpoint: string,
  mode: 'package' | 'image',
) =>
  validateFilesystemSlice(
    {
      mode: 'basic',
      filesystem: {
        partitions: [createBasicPartition({ mountpoint })],
      },
    },
    mode,
  );

const getIssueDetails = (
  errors: ReturnType<typeof validateFilesystemSlice>['errors'],
) => errors.map(({ message, path }) => ({ message, path }));

describe('filesystem mountpoint validation', () => {
  describe('mountpoint policies', () => {
    it('allows package mountpoints except denied paths', () => {
      expect(validateBasicMountpoint('/home', 'package').errors).toEqual([]);
      expect(
        getIssueDetails(
          validateBasicMountpoint('/etc/passwd', 'package').errors,
        ),
      ).toEqual([
        {
          message:
            '/etc/passwd is a reserved mountpoint or a subdirectory of one',
          path: ['filesystem', 'partitions', 0, 'mountpoint'],
        },
      ]);
      expect(
        getIssueDetails(
          validateBasicMountpoint('/usr/local', 'package').errors,
        ),
      ).toEqual([
        {
          message: 'Only /usr can be mounted; its subdirectories cannot',
          path: ['filesystem', 'partitions', 0, 'mountpoint'],
        },
      ]);
    });

    it('allows image-mode mountpoints under permitted paths', () => {
      expect(validateBasicMountpoint('/boot/', 'image').errors).toEqual([]);
      expect(validateBasicMountpoint('/var/log', 'image').errors).toEqual([]);
      expect(
        getIssueDetails(validateBasicMountpoint('/boot/efi', 'image').errors),
      ).toEqual([
        {
          message: 'Subdirectories of /boot cannot be mounted separately',
          path: ['filesystem', 'partitions', 0, 'mountpoint'],
        },
      ]);
      expect(
        getIssueDetails(validateBasicMountpoint('/var/home', 'image').errors),
      ).toEqual([
        {
          message:
            '/var/home is a reserved mountpoint or a subdirectory of one',
          path: ['filesystem', 'partitions', 0, 'mountpoint'],
        },
      ]);
      expect(
        getIssueDetails(validateBasicMountpoint('/home', 'image').errors),
      ).toEqual([
        {
          message: '/home is not allowed in image mode',
          path: ['filesystem', 'partitions', 0, 'mountpoint'],
        },
      ]);
    });
  });

  it('finds duplicate mountpoints across disk partitions and logical volumes', () => {
    const result = validateFilesystemSlice(
      {
        mode: 'advanced',
        disk: {
          unit: 'GiB',
          partitions: [
            createPlainPartition({ id: 'boot', mountpoint: '/' }),
            createVolumeGroup(
              [
                createLogicalVolume({
                  id: 'root-lv',
                  name: 'root-lv',
                  mountpoint: '/',
                }),
                createLogicalVolume({
                  id: 'home-lv',
                  name: 'home-lv',
                  mountpoint: '/',
                }),
              ],
              { id: 'vg-main' },
            ),
          ],
        },
      },
      'image',
    );

    expect(getIssueDetails(result.errors)).toEqual([
      {
        message: 'Duplicate mount points',
        path: ['disk', 'partitions', 'vg-main', 'logical_volumes', 'root-lv'],
      },
      {
        message: 'Duplicate mount points',
        path: ['disk', 'partitions', 'vg-main', 'logical_volumes', 'home-lv'],
      },
    ]);
  });

  it('collects invalid mountpoints from disk partitions and logical volumes', () => {
    const result = validateFilesystemSlice(
      {
        mode: 'advanced',
        disk: {
          unit: 'GiB',
          partitions: [
            createPlainPartition({ mountpoint: '/proc' }),
            createVolumeGroup([
              createLogicalVolume({ name: 'system-lv', mountpoint: '/sys' }),
              createLogicalVolume({ name: 'home-lv', mountpoint: '/home' }),
            ]),
          ],
        },
      },
      'package',
    );

    expect(getIssueDetails(result.errors)).toEqual([
      {
        message: '/proc is a reserved mountpoint or a subdirectory of one',
        path: ['disk', 'partitions', 0, 'mountpoint'],
      },
      {
        message: '/sys is a reserved mountpoint or a subdirectory of one',
        path: ['disk', 'partitions', 1, 'logical_volumes', 0, 'mountpoint'],
      },
    ]);
  });

  it('requires mountpoints for non-swap partitions and logical volumes', () => {
    const result = validateFilesystemSlice(
      {
        mode: 'advanced',
        disk: {
          unit: 'GiB',
          partitions: [
            createPlainPartition({
              id: 'plain-missing-mountpoint',
              mountpoint: undefined,
              fs_type: 'xfs',
            }),
            createPlainPartition({
              id: 'plain-swap',
              mountpoint: undefined,
              fs_type: 'swap',
            }),
            createVolumeGroup(
              [
                createLogicalVolume({
                  id: 'lv-missing-mountpoint',
                  name: 'lv-missing-mountpoint',
                  mountpoint: undefined,
                  fs_type: 'xfs',
                }),
                createLogicalVolume({
                  id: 'lv-swap',
                  name: 'lv-swap',
                  mountpoint: undefined,
                  fs_type: 'swap',
                }),
              ],
              { id: 'vg-main' },
            ),
          ],
        },
      },
      'image',
    );

    expect(getIssueDetails(result.errors)).toEqual([
      {
        message: 'Non-swap filesystems require a mountpoint',
        path: ['disk', 'partitions', 0, 'mountpoint'],
      },
      {
        message: 'Non-swap filesystems require a mountpoint',
        path: ['disk', 'partitions', 2, 'logical_volumes', 0, 'mountpoint'],
      },
    ]);
  });
});
