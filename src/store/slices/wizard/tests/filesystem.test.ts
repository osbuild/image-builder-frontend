import { describe, expect, it } from 'vitest';

import type { FilesystemPartition } from '@/Components/CreateImageWizard/steps/FileSystem/fscTypes';
import wizardReducer, {
  addPartition,
  changeFscMode,
  changePartitionMinSize,
  changePartitionMountpoint,
  changePartitionUnit,
  clearPartitions,
  initialState,
  removePartition,
  removePartitionByMountpoint,
  type wizardState,
} from '@/store/slices/wizard';

const createPartition = (
  overrides: Partial<FilesystemPartition> = {},
): FilesystemPartition => ({
  id: `partition-${Math.random().toString(36).slice(2, 11)}`,
  mountpoint: '/',
  min_size: '10',
  unit: 'GiB',
  ...overrides,
});

describe('filesystem reducers', () => {
  describe('changeFscMode', () => {
    it('should set mode to automatic and clear partitions', () => {
      const stateWithPartitions: wizardState = {
        ...initialState,
        fscMode: 'basic',
        fileSystem: {
          partitions: [createPartition({ mountpoint: '/' })],
        },
      };

      const result = wizardReducer(
        stateWithPartitions,
        changeFscMode('automatic'),
      );

      expect(result.fscMode).toBe('automatic');
      expect(result.fileSystem.partitions).toEqual([]);
    });

    it('should set mode to basic and create root partition', () => {
      const result = wizardReducer(initialState, changeFscMode('basic'));

      expect(result.fscMode).toBe('basic');
      expect(result.fileSystem.partitions).toHaveLength(1);
      expect(result.fileSystem.partitions[0].mountpoint).toBe('/');
      expect(result.fileSystem.partitions[0].min_size).toBe('10');
      expect(result.fileSystem.partitions[0].unit).toBe('GiB');
    });

    it('should set mode to advanced and create root disk partition', () => {
      const result = wizardReducer(initialState, changeFscMode('advanced'));

      expect(result.fscMode).toBe('advanced');
      expect(result.disk.partitions).toHaveLength(1);

      const partition = result.disk.partitions[0];
      // Advanced mode creates a PlainPartitionWithBase (has mountpoint and fs_type)
      expect(partition).toHaveProperty('mountpoint', '/');
      expect(partition).toHaveProperty('fs_type', 'xfs');
      expect(partition).toHaveProperty('type', 'plain');
    });

    it('should not change state when mode is same as current', () => {
      const stateWithBasicMode: wizardState = {
        ...initialState,
        fscMode: 'basic',
        fileSystem: {
          partitions: [
            createPartition({
              id: 'existing',
              mountpoint: '/',
              min_size: '50',
            }),
          ],
        },
      };

      const result = wizardReducer(stateWithBasicMode, changeFscMode('basic'));

      // Should preserve existing partitions since mode didn't change
      expect(result.fileSystem.partitions[0].min_size).toBe('50');
    });
  });

  describe('clearPartitions', () => {
    it('should reset to default root partition in basic mode', () => {
      const stateWithPartitions: wizardState = {
        ...initialState,
        fscMode: 'basic',
        fileSystem: {
          partitions: [
            createPartition({ mountpoint: '/' }),
            createPartition({ mountpoint: '/home' }),
            createPartition({ mountpoint: '/var' }),
          ],
        },
      };

      const result = wizardReducer(stateWithPartitions, clearPartitions());

      expect(result.fileSystem.partitions).toHaveLength(1);
      expect(result.fileSystem.partitions[0].mountpoint).toBe('/');
      expect(result.fileSystem.partitions[0].min_size).toBe('10');
    });

    it('should do nothing in automatic mode', () => {
      const state: wizardState = {
        ...initialState,
        fscMode: 'automatic',
      };

      const result = wizardReducer(state, clearPartitions());

      expect(result.fileSystem.partitions).toEqual([]);
    });
  });

  describe('addPartition', () => {
    it('should add a partition to empty list', () => {
      const partition = createPartition({ mountpoint: '/home' });

      const result = wizardReducer(initialState, addPartition(partition));

      expect(result.fileSystem.partitions).toHaveLength(1);
      expect(result.fileSystem.partitions[0].mountpoint).toBe('/home');
    });

    it('should add partition to existing list', () => {
      const stateWithPartition: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [createPartition({ mountpoint: '/' })],
        },
      };

      const newPartition = createPartition({ mountpoint: '/home' });
      const result = wizardReducer(
        stateWithPartition,
        addPartition(newPartition),
      );

      expect(result.fileSystem.partitions).toHaveLength(2);
    });

    it('should allow duplicate mountpoints (validation handled elsewhere)', () => {
      const stateWithPartition: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [createPartition({ id: 'p1', mountpoint: '/home' })],
        },
      };

      const duplicatePartition = createPartition({
        id: 'p2',
        mountpoint: '/home',
      });
      const result = wizardReducer(
        stateWithPartition,
        addPartition(duplicatePartition),
      );

      expect(result.fileSystem.partitions).toHaveLength(2);
      expect(result.fileSystem.partitions[0].mountpoint).toBe('/home');
      expect(result.fileSystem.partitions[1].mountpoint).toBe('/home');
    });
  });

  describe('removePartition', () => {
    it('should remove partition by id', () => {
      const stateWithPartitions: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [
            createPartition({ id: 'p1', mountpoint: '/' }),
            createPartition({ id: 'p2', mountpoint: '/home' }),
            createPartition({ id: 'p3', mountpoint: '/var' }),
          ],
        },
      };

      const result = wizardReducer(stateWithPartitions, removePartition('p2'));

      expect(result.fileSystem.partitions).toHaveLength(2);
      expect(
        result.fileSystem.partitions.find((p) => p.id === 'p2'),
      ).toBeUndefined();
    });

    it('should do nothing when id not found', () => {
      const stateWithPartitions: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [createPartition({ id: 'p1', mountpoint: '/' })],
        },
      };

      const result = wizardReducer(
        stateWithPartitions,
        removePartition('nonexistent'),
      );

      expect(result.fileSystem.partitions).toHaveLength(1);
    });
  });

  describe('removePartitionByMountpoint', () => {
    it('should remove partition by mountpoint', () => {
      const stateWithPartitions: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [
            createPartition({ id: 'p1', mountpoint: '/' }),
            createPartition({ id: 'p2', mountpoint: '/home' }),
          ],
        },
      };

      const result = wizardReducer(
        stateWithPartitions,
        removePartitionByMountpoint('/home'),
      );

      expect(result.fileSystem.partitions).toHaveLength(1);
      expect(result.fileSystem.partitions[0].mountpoint).toBe('/');
    });

    it('should only remove first matching partition', () => {
      const stateWithDuplicates: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [
            createPartition({ id: 'p1', mountpoint: '/home' }),
            createPartition({ id: 'p2', mountpoint: '/home' }),
          ],
        },
      };

      const result = wizardReducer(
        stateWithDuplicates,
        removePartitionByMountpoint('/home'),
      );

      expect(result.fileSystem.partitions).toHaveLength(1);
    });
  });

  describe('changePartitionMountpoint', () => {
    it('should update partition mountpoint', () => {
      const stateWithPartition: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [createPartition({ id: 'p1', mountpoint: '/' })],
        },
      };

      const result = wizardReducer(
        stateWithPartition,
        changePartitionMountpoint({
          id: 'p1',
          mountpoint: '/home',
          customization: 'fileSystem',
        }),
      );

      expect(result.fileSystem.partitions[0].mountpoint).toBe('/home');
    });
  });

  describe('changePartitionUnit', () => {
    it('should update partition unit', () => {
      const stateWithPartition: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [createPartition({ id: 'p1', unit: 'GiB' })],
        },
      };

      const result = wizardReducer(
        stateWithPartition,
        changePartitionUnit({
          id: 'p1',
          unit: 'MiB',
          customization: 'fileSystem',
        }),
      );

      expect(result.fileSystem.partitions[0].unit).toBe('MiB');
    });
  });

  describe('changePartitionMinSize', () => {
    it('should update partition min_size', () => {
      const stateWithPartition: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [createPartition({ id: 'p1', min_size: '10' })],
        },
      };

      const result = wizardReducer(
        stateWithPartition,
        changePartitionMinSize({
          id: 'p1',
          min_size: '50',
          customization: 'fileSystem',
        }),
      );

      expect(result.fileSystem.partitions[0].min_size).toBe('50');
    });
  });
});
