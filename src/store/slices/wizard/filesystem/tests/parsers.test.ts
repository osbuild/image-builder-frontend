import { describe, expect, it } from 'vitest';

import { UNIT_GIB, UNIT_MIB } from '@/constants';
import {
  BlueprintResponse,
  Customizations,
  Distributions,
} from '@/store/api/backend';

import { parseFilesystemFromRequest } from '../parsers';
import { initialState } from '../state';

const createMinimalBlueprint = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'blueprint-123',
  name: 'test-blueprint',
  description: 'A test blueprint',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: { type: 'aws.s3', options: {} },
    },
  ],
  ...overrides,
});

const withCustomizations = (customizations: Customizations) =>
  createMinimalBlueprint({ customizations });

describe('parseFilesystemFromRequest', () => {
  describe('mode', () => {
    it('returns automatic mode when no filesystem or disk customizations', () => {
      const result = parseFilesystemFromRequest(withCustomizations({}));
      expect(result.mode).toBe('automatic');
    });

    it('returns basic mode when filesystem array is present', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [{ mountpoint: '/', min_size: UNIT_GIB * 10 }],
        }),
      );
      expect(result.mode).toBe('basic');
    });

    it('returns basic mode when filesystem is an empty array', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({ filesystem: [] }),
      );
      expect(result.mode).toBe('basic');
    });

    it('returns advanced mode when disk is present', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          disk: {
            partitions: [
              {
                fs_type: 'xfs' as const,
                mountpoint: '/',
                minsize: '10 GiB',
              },
            ],
          },
        }),
      );
      expect(result.mode).toBe('advanced');
    });

    it('prefers basic mode when both filesystem and disk are present', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [{ mountpoint: '/', min_size: UNIT_GIB * 10 }],
          disk: {
            partitions: [
              {
                fs_type: 'xfs' as const,
                mountpoint: '/',
                minsize: '10 GiB',
              },
            ],
          },
        }),
      );
      expect(result.mode).toBe('basic');
    });
  });

  describe('automatic mode (no customizations)', () => {
    it('returns initial state for empty customizations', () => {
      const result = parseFilesystemFromRequest(withCustomizations({}));
      expect(result).toEqual(initialState);
    });

    it('returns empty disk and filesystem partitions', () => {
      const result = parseFilesystemFromRequest(withCustomizations({}));
      expect(result.disk.partitions).toEqual([]);
      expect(result.fileSystem.partitions).toEqual([]);
    });
  });

  describe('basic mode (filesystem array)', () => {
    it('converts a single filesystem entry to a partition', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [{ mountpoint: '/', min_size: UNIT_GIB * 10 }],
        }),
      );

      expect(result.fileSystem.partitions).toHaveLength(1);
      const partition = result.fileSystem.partitions[0];
      expect(partition.mountpoint).toBe('/');
      expect(partition.min_size).toBe('10');
      expect(partition.unit).toBe('GiB');
      expect(partition.id).toEqual(expect.any(String));
    });

    it('converts multiple filesystem entries', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [
            { mountpoint: '/', min_size: UNIT_GIB * 10 },
            { mountpoint: '/home', min_size: UNIT_GIB * 20 },
            { mountpoint: '/var', min_size: UNIT_MIB * 512 },
          ],
        }),
      );

      expect(result.fileSystem.partitions).toHaveLength(3);
      expect(result.fileSystem.partitions[0].mountpoint).toBe('/');
      expect(result.fileSystem.partitions[0].min_size).toBe('10');
      expect(result.fileSystem.partitions[0].unit).toBe('GiB');

      expect(result.fileSystem.partitions[1].mountpoint).toBe('/home');
      expect(result.fileSystem.partitions[1].min_size).toBe('20');
      expect(result.fileSystem.partitions[1].unit).toBe('GiB');

      expect(result.fileSystem.partitions[2].mountpoint).toBe('/var');
      expect(result.fileSystem.partitions[2].min_size).toBe('512');
      expect(result.fileSystem.partitions[2].unit).toBe('MiB');
    });

    it('assigns unique IDs to each partition', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [
            { mountpoint: '/', min_size: UNIT_GIB * 10 },
            { mountpoint: '/home', min_size: UNIT_GIB * 5 },
          ],
        }),
      );

      const ids = result.fileSystem.partitions.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('parses size in bytes when not aligned to MiB or GiB', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [{ mountpoint: '/boot', min_size: 500000 }],
        }),
      );

      expect(result.fileSystem.partitions[0].min_size).toBe('500000');
      expect(result.fileSystem.partitions[0].unit).toBe('B');
    });

    it('keeps disk partitions empty in basic mode', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          filesystem: [{ mountpoint: '/', min_size: UNIT_GIB * 10 }],
        }),
      );
      expect(result.disk.partitions).toEqual([]);
    });
  });

  describe('advanced mode (disk)', () => {
    describe('disk-level properties', () => {
      it('parses disk minsize and unit', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              minsize: '50 GiB',
              partitions: [],
            },
          }),
        );

        expect(result.disk.minsize).toBe('50');
        expect(result.disk.unit).toBe('GiB');
      });

      it('defaults disk unit to GiB when not specified in minsize', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [],
            },
          }),
        );

        expect(result.disk.minsize).toBe('');
        expect(result.disk.unit).toBe('GiB');
      });

      it('parses disk type (gpt)', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              type: 'gpt',
              partitions: [],
            },
          }),
        );

        expect(result.disk.type).toBe('gpt');
      });

      it('parses disk type (dos)', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              type: 'dos',
              partitions: [],
            },
          }),
        );

        expect(result.disk.type).toBe('dos');
      });

      it('defaults disk type to undefined when not set', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [],
            },
          }),
        );

        expect(result.disk.type).toBeUndefined();
      });
    });

    describe('plain partitions', () => {
      it('converts a plain partition with minsize', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  fs_type: 'xfs' as const,
                  mountpoint: '/',
                  minsize: '10 GiB',
                },
              ],
            },
          }),
        );

        expect(result.disk.partitions).toHaveLength(1);
        const partition = result.disk.partitions[0];
        expect(partition.id).toEqual(expect.any(String));
        expect(partition.min_size).toBe('10');
        expect(partition.unit).toBe('GiB');
        expect('fs_type' in partition && partition.fs_type).toBe('xfs');
        expect('mountpoint' in partition && partition.mountpoint).toBe('/');
      });

      it('defaults unit to GiB when minsize has no unit', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  fs_type: 'ext4' as const,
                  mountpoint: '/data',
                },
              ],
            },
          }),
        );

        const partition = result.disk.partitions[0];
        expect(partition.unit).toBe('GiB');
      });

      it('converts multiple plain partitions with different fs_types', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  fs_type: 'xfs' as const,
                  mountpoint: '/',
                  minsize: '10 GiB',
                },
                {
                  fs_type: 'ext4' as const,
                  mountpoint: '/home',
                  minsize: '20 GiB',
                },
                {
                  fs_type: 'vfat' as const,
                  mountpoint: '/boot/efi',
                  minsize: '512 MiB',
                },
              ],
            },
          }),
        );

        expect(result.disk.partitions).toHaveLength(3);
      });
    });

    describe('LVM volume groups', () => {
      it('converts a volume group with logical volumes', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  type: 'lvm' as const,
                  name: 'myvg',
                  minsize: '50 GiB',
                  logical_volumes: [
                    {
                      name: 'root',
                      fs_type: 'xfs' as const,
                      mountpoint: '/',
                      minsize: '10 GiB',
                    },
                    {
                      name: 'home',
                      fs_type: 'ext4' as const,
                      mountpoint: '/home',
                      minsize: '30 GiB',
                    },
                  ],
                },
              ],
            },
          }),
        );

        expect(result.disk.partitions).toHaveLength(1);
        const vg = result.disk.partitions[0];
        expect(vg.id).toEqual(expect.any(String));
        expect(vg.min_size).toBe('50');
        expect(vg.unit).toBe('GiB');

        expect('logical_volumes' in vg).toBe(true);
        if ('logical_volumes' in vg) {
          expect(vg.name).toBe('myvg');
          expect(vg.type).toBe('lvm');
          expect(vg.logical_volumes).toHaveLength(2);

          expect(vg.logical_volumes[0].name).toBe('root');
          expect(vg.logical_volumes[0].fs_type).toBe('xfs');
          expect(vg.logical_volumes[0].mountpoint).toBe('/');
          expect(vg.logical_volumes[0].min_size).toBe('10');
          expect(vg.logical_volumes[0].unit).toBe('GiB');
          expect(vg.logical_volumes[0].id).toEqual(expect.any(String));

          expect(vg.logical_volumes[1].name).toBe('home');
          expect(vg.logical_volumes[1].fs_type).toBe('ext4');
          expect(vg.logical_volumes[1].mountpoint).toBe('/home');
          expect(vg.logical_volumes[1].min_size).toBe('30');
          expect(vg.logical_volumes[1].unit).toBe('GiB');
        }
      });

      it('assigns unique IDs to volume group and its logical volumes', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  type: 'lvm' as const,
                  name: 'myvg',
                  logical_volumes: [
                    {
                      name: 'lv1',
                      fs_type: 'xfs' as const,
                      mountpoint: '/',
                    },
                    {
                      name: 'lv2',
                      fs_type: 'ext4' as const,
                      mountpoint: '/home',
                    },
                  ],
                },
              ],
            },
          }),
        );

        const vg = result.disk.partitions[0];
        expect('logical_volumes' in vg).toBe(true);
        if ('logical_volumes' in vg) {
          const allIds = [vg.id, ...vg.logical_volumes.map((lv) => lv.id)];
          expect(new Set(allIds).size).toBe(allIds.length);
        }
      });

      it('defaults logical volume unit to GiB when minsize not provided', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  type: 'lvm' as const,
                  name: 'myvg',
                  logical_volumes: [
                    {
                      name: 'lv1',
                      fs_type: 'xfs' as const,
                      mountpoint: '/',
                    },
                  ],
                },
              ],
            },
          }),
        );

        const vg = result.disk.partitions[0];
        if ('logical_volumes' in vg) {
          expect(vg.logical_volumes[0].unit).toBe('GiB');
        }
      });
    });

    describe('btrfs volumes', () => {
      it('converts a btrfs volume with subvolumes', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              partitions: [
                {
                  type: 'btrfs' as const,
                  minsize: '40 GiB',
                  subvolumes: [
                    { name: '@root', mountpoint: '/' },
                    { name: '@home', mountpoint: '/home' },
                  ],
                },
              ],
            },
          }),
        );

        expect(result.disk.partitions).toHaveLength(1);
        const btrfs = result.disk.partitions[0];
        expect(btrfs.id).toEqual(expect.any(String));
        expect(btrfs.min_size).toBe('40');
        expect(btrfs.unit).toBe('GiB');
        expect('subvolumes' in btrfs).toBe(true);
        if ('subvolumes' in btrfs) {
          expect(btrfs.type).toBe('btrfs');
          expect(btrfs.subvolumes).toEqual([
            { name: '@root', mountpoint: '/' },
            { name: '@home', mountpoint: '/home' },
          ]);
        }
      });
    });

    describe('mixed partition types', () => {
      it('handles a disk with plain, LVM, and btrfs partitions', () => {
        const result = parseFilesystemFromRequest(
          withCustomizations({
            disk: {
              type: 'gpt',
              minsize: '100 GiB',
              partitions: [
                {
                  fs_type: 'vfat' as const,
                  mountpoint: '/boot/efi',
                  minsize: '512 MiB',
                },
                {
                  type: 'lvm' as const,
                  name: 'sysvg',
                  minsize: '60 GiB',
                  logical_volumes: [
                    {
                      name: 'root',
                      fs_type: 'xfs' as const,
                      mountpoint: '/',
                      minsize: '20 GiB',
                    },
                  ],
                },
                {
                  type: 'btrfs' as const,
                  minsize: '30 GiB',
                  subvolumes: [{ name: '@data', mountpoint: '/data' }],
                },
              ],
            },
          }),
        );

        expect(result.disk.partitions).toHaveLength(3);
        expect(result.disk.type).toBe('gpt');
        expect(result.disk.minsize).toBe('100');
        expect(result.disk.unit).toBe('GiB');

        // Plain partition
        const plain = result.disk.partitions[0];
        expect('fs_type' in plain && plain.fs_type).toBe('vfat');

        // LVM
        const lvm = result.disk.partitions[1];
        expect('logical_volumes' in lvm).toBe(true);

        // Btrfs
        const btrfs = result.disk.partitions[2];
        expect('subvolumes' in btrfs).toBe(true);
      });
    });

    it('keeps filesystem partitions empty in advanced mode', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({
          disk: {
            partitions: [
              {
                fs_type: 'xfs' as const,
                mountpoint: '/',
                minsize: '10 GiB',
              },
            ],
          },
        }),
      );
      expect(result.fileSystem.partitions).toEqual([]);
    });
  });

  describe('partitioningMode', () => {
    it('passes through raw partitioning mode', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({ partitioning_mode: 'raw' }),
      );
      expect(result.partitioningMode).toBe('raw');
    });

    it('passes through lvm partitioning mode', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({ partitioning_mode: 'lvm' }),
      );
      expect(result.partitioningMode).toBe('lvm');
    });

    it('passes through auto-lvm partitioning mode', () => {
      const result = parseFilesystemFromRequest(
        withCustomizations({ partitioning_mode: 'auto-lvm' }),
      );
      expect(result.partitioningMode).toBe('auto-lvm');
    });

    it('defaults to undefined when not provided', () => {
      const result = parseFilesystemFromRequest(withCustomizations({}));
      expect(result.partitioningMode).toBeUndefined();
    });
  });
});
