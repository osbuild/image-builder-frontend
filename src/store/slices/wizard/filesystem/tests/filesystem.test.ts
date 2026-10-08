import { describe, expect, it } from 'vitest';

import type { RootState } from '@/store';
import {
  initialState,
  wizardReducer,
  WizardState,
} from '@/store/slices/wizard';

import {
  createBasicPartition,
  createPlainPartition,
  createVolumeGroup,
} from './mocks';

import {
  addPartition,
  changeFscMode,
  changePartitionMinSize,
  changePartitionMountpoint,
  changePartitionUnit,
  clearPartitions,
  removePartition,
  removePartitionByMountpoint,
  selectAdvancedPartitionCount,
  selectBasicPartitionCount,
  selectFSConfigurationsCount,
  selectLogicalVolumeCount,
  selectPartitionCount,
} from '..';

// Alias for backward compatibility with existing tests
const createPartition = createBasicPartition;

const getBasicFilesystem = (state: WizardState) => {
  if (state.filesystem.mode !== 'basic') {
    throw new Error('Expected basic filesystem mode');
  }
  return state.filesystem;
};

describe('filesystem reducers', () => {
  describe('changeFscMode', () => {
    it('should set mode to automatic and clear partitions', () => {
      const stateWithPartitions: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ mountpoint: '/' })],
          },
          partitioningMode: undefined,
        },
      };

      const result = wizardReducer(
        stateWithPartitions,
        changeFscMode('automatic'),
      );

      expect(result.filesystem).toEqual({ mode: 'automatic' });
    });

    it('should set mode to basic and create root partition', () => {
      const result = wizardReducer(initialState, changeFscMode('basic'));

      expect(result.filesystem).toMatchObject({
        mode: 'basic',
        filesystem: {
          partitions: [{ mountpoint: '/', min_size: '10', unit: 'GiB' }],
        },
      });
    });

    it('should set mode to advanced and create root disk partition', () => {
      const result = wizardReducer(initialState, changeFscMode('advanced'));

      expect(result.filesystem).toMatchObject({
        mode: 'advanced',
        disk: {
          minsize: '',
          unit: 'GiB',
          type: undefined,
          partitions: [
            {
              mountpoint: '/',
              fs_type: 'xfs',
              type: 'plain',
            },
          ],
        },
      });
    });

    it('should not change state when mode is same as current', () => {
      const stateWithBasicMode: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({
                id: 'existing',
                mountpoint: '/',
                min_size: '50',
              }),
            ],
          },
          partitioningMode: undefined,
        },
      };

      const result = wizardReducer(stateWithBasicMode, changeFscMode('basic'));

      // Should preserve existing partitions since mode didn't change
      expect(result.filesystem).toMatchObject({
        mode: 'basic',
        filesystem: { partitions: [{ min_size: '50' }] },
      });
    });
  });

  describe('clearPartitions', () => {
    it('should reset to default root partition in basic mode', () => {
      const stateWithPartitions: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ mountpoint: '/' }),
              createPartition({ mountpoint: '/home' }),
              createPartition({ mountpoint: '/var' }),
            ],
          },
        },
      };

      const result = wizardReducer(stateWithPartitions, clearPartitions());

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(1);
      expect(
        getBasicFilesystem(result).filesystem.partitions[0].mountpoint,
      ).toBe('/');
      expect(getBasicFilesystem(result).filesystem.partitions[0].min_size).toBe(
        '10',
      );
    });

    it('should do nothing in automatic mode', () => {
      const state: WizardState = {
        ...initialState,
        filesystem: {
          ...initialState.filesystem,
          mode: 'automatic',
        },
      };

      const result = wizardReducer(state, clearPartitions());

      expect(result.filesystem).toEqual({ mode: 'automatic' });
    });
  });

  describe('addPartition', () => {
    it('should add a partition to empty list', () => {
      const partition = createPartition({ mountpoint: '/home' });

      const result = wizardReducer(
        {
          ...initialState,
          filesystem: {
            mode: 'basic',
            filesystem: { partitions: [] },
          },
        },
        addPartition(partition),
      );

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(1);
      expect(
        getBasicFilesystem(result).filesystem.partitions[0].mountpoint,
      ).toBe('/home');
    });

    it('should add partition to existing list', () => {
      const stateWithPartition: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ mountpoint: '/' })],
          },
        },
      };

      const newPartition = createPartition({ mountpoint: '/home' });
      const result = wizardReducer(
        stateWithPartition,
        addPartition(newPartition),
      );

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(2);
    });

    it('should allow duplicate mountpoints (validation handled elsewhere)', () => {
      const stateWithPartition: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ id: 'p1', mountpoint: '/home' })],
          },
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

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(2);
      expect(
        getBasicFilesystem(result).filesystem.partitions[0].mountpoint,
      ).toBe('/home');
      expect(
        getBasicFilesystem(result).filesystem.partitions[1].mountpoint,
      ).toBe('/home');
    });
  });

  describe('removePartition', () => {
    it('should remove partition by id', () => {
      const stateWithPartitions: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ id: 'p1', mountpoint: '/' }),
              createPartition({ id: 'p2', mountpoint: '/home' }),
              createPartition({ id: 'p3', mountpoint: '/var' }),
            ],
          },
        },
      };

      const result = wizardReducer(stateWithPartitions, removePartition('p2'));

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(2);
      expect(
        getBasicFilesystem(result).filesystem.partitions.find(
          (p) => p.id === 'p2',
        ),
      ).toBeUndefined();
    });

    it('should do nothing when id not found', () => {
      const stateWithPartitions: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ id: 'p1', mountpoint: '/' })],
          },
        },
      };

      const result = wizardReducer(
        stateWithPartitions,
        removePartition('nonexistent'),
      );

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(1);
    });
  });

  describe('removePartitionByMountpoint', () => {
    it('should remove partition by mountpoint', () => {
      const stateWithPartitions: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ id: 'p1', mountpoint: '/' }),
              createPartition({ id: 'p2', mountpoint: '/home' }),
            ],
          },
        },
      };

      const result = wizardReducer(
        stateWithPartitions,
        removePartitionByMountpoint('/home'),
      );

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(1);
      expect(
        getBasicFilesystem(result).filesystem.partitions[0].mountpoint,
      ).toBe('/');
    });

    it('should only remove first matching partition', () => {
      const stateWithDuplicates: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ id: 'p1', mountpoint: '/home' }),
              createPartition({ id: 'p2', mountpoint: '/home' }),
            ],
          },
        },
      };

      const result = wizardReducer(
        stateWithDuplicates,
        removePartitionByMountpoint('/home'),
      );

      expect(getBasicFilesystem(result).filesystem.partitions).toHaveLength(1);
    });
  });

  describe('changePartitionMountpoint', () => {
    it('should update partition mountpoint', () => {
      const stateWithPartition: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ id: 'p1', mountpoint: '/' })],
          },
        },
      };

      const result = wizardReducer(
        stateWithPartition,
        changePartitionMountpoint({
          id: 'p1',
          mountpoint: '/home',
          customization: 'filesystem',
        }),
      );

      expect(
        getBasicFilesystem(result).filesystem.partitions[0].mountpoint,
      ).toBe('/home');
    });
  });

  describe('changePartitionUnit', () => {
    it('should update partition unit', () => {
      const stateWithPartition: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ id: 'p1', unit: 'GiB' })],
          },
        },
      };

      const result = wizardReducer(
        stateWithPartition,
        changePartitionUnit({
          id: 'p1',
          unit: 'MiB',
          customization: 'filesystem',
        }),
      );

      expect(getBasicFilesystem(result).filesystem.partitions[0].unit).toBe(
        'MiB',
      );
    });
  });

  describe('changePartitionMinSize', () => {
    it('should update partition min_size', () => {
      const stateWithPartition: WizardState = {
        ...initialState,
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [createPartition({ id: 'p1', min_size: '10' })],
          },
        },
      };

      const result = wizardReducer(
        stateWithPartition,
        changePartitionMinSize({
          id: 'p1',
          min_size: '50',
          customization: 'filesystem',
        }),
      );

      expect(getBasicFilesystem(result).filesystem.partitions[0].min_size).toBe(
        '50',
      );
    });
  });
});

// Helper to create minimal RootState for selector tests
const createState = (wizardOverrides: Partial<WizardState>): RootState =>
  ({
    wizard: {
      ...initialState,
      ...wizardOverrides,
    },
  }) as RootState;

describe('filesystem selectors', () => {
  describe('selectBasicPartitionCount', () => {
    it('returns count of basic partitions', () => {
      const state = createState({
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ mountpoint: '/' }),
              createPartition({ mountpoint: '/home' }),
            ],
          },
        },
      });

      expect(selectBasicPartitionCount(state)).toBe(2);
    });

    it('returns 0 when no partitions', () => {
      const state = createState({
        filesystem: {
          mode: 'basic',
          filesystem: { partitions: [] },
        },
      });

      expect(selectBasicPartitionCount(state)).toBe(0);
    });
  });

  describe('selectAdvancedPartitionCount', () => {
    it('counts plain partitions', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [
              createPlainPartition({ mountpoint: '/boot' }),
              createPlainPartition({ mountpoint: '/efi' }),
            ],
          },
        },
      });

      expect(selectAdvancedPartitionCount(state)).toBe(2);
    });

    it('excludes LVM volume groups from count', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [
              createPlainPartition({ mountpoint: '/boot' }),
              createVolumeGroup([
                {
                  id: 'lv1',
                  mountpoint: '/',
                  min_size: '10',
                  unit: 'GiB',
                  name: 'root',
                  fs_type: 'xfs',
                },
              ]),
            ],
          },
        },
      });

      expect(selectAdvancedPartitionCount(state)).toBe(1);
    });
  });

  describe('selectLogicalVolumeCount', () => {
    it('returns 0 when no LVM partitions', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [createPlainPartition({ mountpoint: '/boot' })],
          },
        },
      });

      expect(selectLogicalVolumeCount(state)).toBe(0);
    });

    it('counts logical volumes inside LVM groups', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [
              createVolumeGroup([
                {
                  id: 'lv1',
                  mountpoint: '/',
                  min_size: '10',
                  unit: 'GiB',
                  name: 'root',
                  fs_type: 'xfs',
                },
                {
                  id: 'lv2',
                  mountpoint: '/home',
                  min_size: '5',
                  unit: 'GiB',
                  name: 'home',
                  fs_type: 'xfs',
                },
              ]),
            ],
          },
        },
      });

      expect(selectLogicalVolumeCount(state)).toBe(2);
    });

    it('sums logical volumes across multiple LVM groups', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [
              createVolumeGroup([
                {
                  id: 'lv1',
                  mountpoint: '/',
                  min_size: '10',
                  unit: 'GiB',
                  name: 'root',
                  fs_type: 'xfs',
                },
              ]),
              createVolumeGroup([
                {
                  id: 'lv2',
                  mountpoint: '/var',
                  min_size: '5',
                  unit: 'GiB',
                  name: 'var',
                  fs_type: 'xfs',
                },
                {
                  id: 'lv3',
                  mountpoint: '/home',
                  min_size: '20',
                  unit: 'GiB',
                  name: 'home',
                  fs_type: 'xfs',
                },
              ]),
            ],
          },
        },
      });

      expect(selectLogicalVolumeCount(state)).toBe(3);
    });
  });

  describe('selectPartitionCount', () => {
    it('returns basic count in basic mode', () => {
      const state = createState({
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ mountpoint: '/' }),
              createPartition({ mountpoint: '/home' }),
            ],
          },
        },
      });

      expect(selectPartitionCount(state)).toBe(2);
    });

    it('returns advanced count in advanced mode', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [
              createPlainPartition({ mountpoint: '/boot' }),
              createPlainPartition({ mountpoint: '/efi' }),
            ],
          },
        },
      });

      expect(selectPartitionCount(state)).toBe(2);
    });

    it('returns 0 in automatic mode', () => {
      const state = createState({
        filesystem: {
          ...initialState.filesystem,
          mode: 'automatic',
        },
      });

      expect(selectPartitionCount(state)).toBe(0);
    });
  });

  describe('selectFSConfigurationsCount', () => {
    it('returns sum of partitions and logical volumes', () => {
      const state = createState({
        filesystem: {
          mode: 'advanced',
          disk: {
            minsize: '',
            unit: 'GiB',
            type: 'gpt',
            partitions: [
              createPlainPartition({ mountpoint: '/boot' }),
              createVolumeGroup([
                {
                  id: 'lv1',
                  mountpoint: '/',
                  min_size: '10',
                  unit: 'GiB',
                  name: 'root',
                  fs_type: 'xfs',
                },
                {
                  id: 'lv2',
                  mountpoint: '/home',
                  min_size: '5',
                  unit: 'GiB',
                  name: 'home',
                  fs_type: 'xfs',
                },
              ]),
            ],
          },
        },
      });

      // 1 partition + 2 logical volumes = 3
      expect(selectFSConfigurationsCount(state)).toBe(3);
    });

    it('returns basic partition count in basic mode', () => {
      const state = createState({
        filesystem: {
          mode: 'basic',
          filesystem: {
            partitions: [
              createPartition({ mountpoint: '/' }),
              createPartition({ mountpoint: '/home' }),
            ],
          },
        },
      });

      // 2 partitions + 0 logical volumes = 2
      expect(selectFSConfigurationsCount(state)).toBe(2);
    });
  });
});
