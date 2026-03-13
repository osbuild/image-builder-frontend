import { describe, expect, it } from 'vitest';

import wizardReducer, {
  addImageType,
  changeArchitecture,
  changeDistribution,
  changeImageTypes,
  initializeWizard,
  initialState,
  loadWizardState,
  removeImageType,
  type wizardState,
} from '@/store/slices/wizard';

describe('wizardSlice core reducers', () => {
  describe('initializeWizard', () => {
    it('should reset state to initial state', () => {
      const modifiedState: wizardState = {
        ...initialState,
        distribution: 'rhel-8',
        architecture: 'aarch64',
        imageTypes: ['aws', 'gcp'],
        hostname: 'modified-hostname',
      };

      const result = wizardReducer(modifiedState, initializeWizard());

      expect(result).toEqual(initialState);
    });

    it('should reset users array to empty', () => {
      const stateWithUsers: wizardState = {
        ...initialState,
        users: [
          {
            name: 'user1',
            password: 'pass',
            ssh_key: 'key',
            groups: ['wheel'],
            isAdministrator: true,
            hasPassword: true,
          },
        ],
      };

      const result = wizardReducer(stateWithUsers, initializeWizard());

      expect(result.users).toEqual([]);
    });

    it('should reset partitions to empty arrays', () => {
      const stateWithPartitions: wizardState = {
        ...initialState,
        fileSystem: {
          partitions: [
            { id: '1', mountpoint: '/', min_size: '10', unit: 'GiB' },
          ],
        },
        disk: {
          minsize: '50',
          partitions: [
            {
              id: '2',
              mountpoint: '/home',
              fs_type: 'xfs',
              min_size: '20',
              unit: 'GiB',
              type: 'plain',
            },
          ],
          type: 'gpt',
        },
      };

      const result = wizardReducer(stateWithPartitions, initializeWizard());

      expect(result.fileSystem.partitions).toEqual([]);
      expect(result.disk.partitions).toEqual([]);
    });
  });

  describe('loadWizardState', () => {
    it('should load provided state', () => {
      const stateToLoad: wizardState = {
        ...initialState,
        distribution: 'rhel-9',
        architecture: 'aarch64',
        hostname: 'loaded-hostname',
      };

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.distribution).toBe('rhel-9');
      expect(result.architecture).toBe('aarch64');
      expect(result.hostname).toBe('loaded-hostname');
    });

    it('should completely replace existing state', () => {
      const existingState: wizardState = {
        ...initialState,
        hostname: 'existing-hostname',
        users: [
          {
            name: 'existinguser',
            password: '',
            ssh_key: '',
            groups: [],
            isAdministrator: false,
            hasPassword: false,
          },
        ],
      };

      const newState: wizardState = {
        ...initialState,
        hostname: 'new-hostname',
        users: [],
      };

      const result = wizardReducer(existingState, loadWizardState(newState));

      expect(result.hostname).toBe('new-hostname');
      expect(result.users).toEqual([]);
    });
  });

  describe('changeDistribution', () => {
    it('should update distribution', () => {
      const result = wizardReducer(initialState, changeDistribution('rhel-9'));

      expect(result.distribution).toBe('rhel-9');
    });
  });

  describe('changeArchitecture', () => {
    it('should update architecture', () => {
      const result = wizardReducer(initialState, changeArchitecture('aarch64'));

      expect(result.architecture).toBe('aarch64');
    });
  });

  describe('image type management', () => {
    describe('addImageType', () => {
      it('should add an image type to empty array', () => {
        const result = wizardReducer(initialState, addImageType('aws'));

        expect(result.imageTypes).toContain('aws');
        expect(result.imageTypes).toHaveLength(1);
      });

      it('should add multiple image types', () => {
        let state = wizardReducer(initialState, addImageType('aws'));
        state = wizardReducer(state, addImageType('gcp'));
        state = wizardReducer(state, addImageType('azure'));

        expect(state.imageTypes).toEqual(['aws', 'gcp', 'azure']);
      });

      it('should not add duplicate image types', () => {
        let state = wizardReducer(initialState, addImageType('aws'));
        state = wizardReducer(state, addImageType('aws'));

        expect(state.imageTypes).toEqual(['aws']);
      });
    });

    describe('removeImageType', () => {
      it('should remove an existing image type', () => {
        const stateWithTypes: wizardState = {
          ...initialState,
          imageTypes: ['aws', 'gcp', 'azure'],
        };

        const result = wizardReducer(stateWithTypes, removeImageType('gcp'));

        expect(result.imageTypes).toEqual(['aws', 'azure']);
      });

      it('should do nothing when removing non-existent type', () => {
        const stateWithTypes: wizardState = {
          ...initialState,
          imageTypes: ['aws', 'gcp'],
        };

        const result = wizardReducer(stateWithTypes, removeImageType('azure'));

        expect(result.imageTypes).toEqual(['aws', 'gcp']);
      });
    });

    describe('changeImageTypes', () => {
      it('should replace all image types', () => {
        const stateWithTypes: wizardState = {
          ...initialState,
          imageTypes: ['aws', 'gcp'],
        };

        const result = wizardReducer(
          stateWithTypes,
          changeImageTypes(['azure', 'vsphere']),
        );

        expect(result.imageTypes).toEqual(['azure', 'vsphere']);
      });

      it('should set empty array', () => {
        const stateWithTypes: wizardState = {
          ...initialState,
          imageTypes: ['aws', 'gcp'],
        };

        const result = wizardReducer(stateWithTypes, changeImageTypes([]));

        expect(result.imageTypes).toEqual([]);
      });
    });
  });
});
