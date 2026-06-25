import { describe, expect, it } from 'vitest';

import { createMockState } from '../../tests/mockWizardState';
import { mapFilesystemCustomizations } from '../mappers';
import { initialState } from '../state';
import type { FilesystemSlice } from '../types';

const createState = (overrides: Partial<FilesystemSlice> = {}) =>
  createMockState({
    filesystem: { ...initialState, ...overrides },
  });

describe('mapFilesystemCustomizations', () => {
  it('returns empty object for automatic mode', () => {
    const state = createState();
    expect(mapFilesystemCustomizations(state)).toEqual({});
  });

  describe('basic mode (filesystem)', () => {
    it('returns filesystem partitions with converted sizes', () => {
      const state = createState({
        mode: 'basic',
        fileSystem: {
          partitions: [
            { id: '1', mountpoint: '/', min_size: '10', unit: 'GiB' },
            { id: '2', mountpoint: '/home', min_size: '5', unit: 'GiB' },
          ],
        },
      });
      const result = mapFilesystemCustomizations(state);
      expect(result.filesystem).toEqual([
        { min_size: 10737418240, mountpoint: '/' },
        { min_size: 5368709120, mountpoint: '/home' },
      ]);
    });

    it('omits disk key in basic mode', () => {
      const state = createState({
        mode: 'basic',
        fileSystem: {
          partitions: [
            { id: '1', mountpoint: '/', min_size: '10', unit: 'GiB' },
          ],
        },
      });
      expect(mapFilesystemCustomizations(state)).not.toHaveProperty('disk');
    });
  });

  describe('advanced mode (disk)', () => {
    it('returns disk with plain partitions', () => {
      const state = createState({
        mode: 'advanced',
        disk: {
          minsize: '50',
          unit: 'GiB',
          type: 'gpt',
          partitions: [
            {
              id: '1',
              min_size: '10',
              unit: 'GiB',
              fs_type: 'ext4',
              mountpoint: '/',
              type: 'plain',
            },
          ],
        },
      });
      const result = mapFilesystemCustomizations(state);
      expect(result.disk).toEqual({
        type: 'gpt',
        minsize: '50 GiB',
        partitions: [
          {
            minsize: '10 GiB',
            fs_type: 'ext4',
            mountpoint: '/',
            type: 'plain',
          },
        ],
      });
    });

    it('returns disk with lvm partitions including logical volumes', () => {
      const state = createState({
        mode: 'advanced',
        disk: {
          minsize: '',
          unit: 'GiB',
          type: 'gpt',
          partitions: [
            {
              id: '1',
              min_size: '20',
              unit: 'GiB',
              type: 'lvm',
              name: 'myvg',
              logical_volumes: [
                {
                  id: 'lv1',
                  min_size: '10',
                  unit: 'GiB',
                  name: 'root',
                  fs_type: 'ext4',
                  mountpoint: '/',
                },
              ],
            },
          ],
        },
      });
      const result = mapFilesystemCustomizations(state);
      expect(result.disk!.partitions[0]).toEqual({
        minsize: '20 GiB',
        name: 'myvg',
        type: 'lvm',
        logical_volumes: [
          {
            minsize: '10 GiB',
            name: 'root',
            fs_type: 'ext4',
            mountpoint: '/',
          },
        ],
      });
    });

    it('returns disk with btrfs partitions', () => {
      const state = createState({
        mode: 'advanced',
        disk: {
          minsize: '',
          unit: 'GiB',
          type: 'gpt',
          partitions: [
            {
              id: '1',
              min_size: '30',
              unit: 'GiB',
              type: 'btrfs',
              subvolumes: [{ name: 'root', mountpoint: '/' }],
            },
          ],
        },
      });
      const result = mapFilesystemCustomizations(state);
      expect(result.disk!.partitions[0]).toEqual({
        minsize: '30 GiB',
        type: 'btrfs',
        subvolumes: [{ name: 'root', mountpoint: '/' }],
      });
    });

    it('sets disk minsize to undefined when empty', () => {
      const state = createState({
        mode: 'advanced',
        disk: {
          minsize: '',
          unit: 'GiB',
          type: 'gpt',
          partitions: [],
        },
      });
      const result = mapFilesystemCustomizations(state);
      expect(result.disk!.minsize).toBeUndefined();
    });

    it('omits filesystem key in advanced mode', () => {
      const state = createState({
        mode: 'advanced',
        disk: {
          minsize: '',
          unit: 'GiB',
          type: 'gpt',
          partitions: [],
        },
      });
      expect(mapFilesystemCustomizations(state)).not.toHaveProperty(
        'filesystem',
      );
    });
  });

  describe('partitioning mode', () => {
    it('includes partitioning_mode when set', () => {
      const state = createState({ partitioningMode: 'auto-lvm' });
      expect(mapFilesystemCustomizations(state)).toEqual(
        expect.objectContaining({
          partitioning_mode: 'auto-lvm',
        }),
      );
    });

    it('omits partitioning_mode when undefined', () => {
      const state = createState({ partitioningMode: undefined });
      expect(mapFilesystemCustomizations(state)).not.toHaveProperty(
        'partitioning_mode',
      );
    });
  });
});
