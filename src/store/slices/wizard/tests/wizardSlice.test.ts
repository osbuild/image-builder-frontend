import { describe, expect, it } from 'vitest';

import {
  addImageType,
  changeArchitecture,
  changeDistribution,
  changeImageTypes,
  clearLocale,
  clearTimezone,
  initializeWizard,
  initialState,
  loadWizardState,
  removeImageType,
  wizardReducer,
  type WizardState,
} from '@/store/slices/wizard';

describe('wizardSlice core reducers', () => {
  describe('initializeWizard', () => {
    it('should reset state to initial state', () => {
      const modifiedState: WizardState = {
        ...initialState,
        output: {
          ...initialState.output,
          distribution: 'rhel-8',
          architecture: 'aarch64',
          imageTypes: ['aws', 'gcp'],
        },
        system: {
          ...initialState.system,
          hostname: 'modified-hostname',
        },
      };

      const result = wizardReducer(modifiedState, initializeWizard());

      expect(result).toEqual(initialState);
    });

    it('should reset users array to empty', () => {
      const stateWithUsers: WizardState = {
        ...initialState,
        system: {
          ...initialState.system,
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
        },
      };

      const result = wizardReducer(stateWithUsers, initializeWizard());

      expect(result.system.users).toEqual([]);
    });

    it('should reset partitions to empty arrays', () => {
      const stateWithPartitions: WizardState = {
        ...initialState,
        filesystem: {
          ...initialState.filesystem,
          fileSystem: {
            partitions: [
              { id: '1', mountpoint: '/', min_size: '10', unit: 'GiB' },
            ],
          },
          disk: {
            minsize: '50',
            unit: 'GiB',
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
        },
      };

      const result = wizardReducer(stateWithPartitions, initializeWizard());

      expect(result.filesystem.fileSystem.partitions).toEqual([]);
      expect(result.filesystem.disk.partitions).toEqual([]);
    });
  });

  describe('loadWizardState', () => {
    it('should load provided state across all slices', () => {
      const stateToLoad: WizardState = {
        ...initialState,
        output: {
          ...initialState.output,
          distribution: 'rhel-9',
          architecture: 'aarch64',
        },
        system: {
          ...initialState.system,
          hostname: 'loaded-hostname',
        },
        filesystem: {
          ...initialState.filesystem,
          mode: 'advanced',
          disk: {
            ...initialState.filesystem.disk,
            minsize: '20',
            unit: 'GiB',
          },
        },
        compliance: {
          ...initialState.compliance,
          type: 'openscap',
          profileID: 'xccdf_org.ssgproject.content_profile_cis',
          fips: { enabled: true },
        },
        details: {
          ...initialState.details,
          mode: 'edit',
          blueprintId: 'bp-123',
          blueprint: {
            ...initialState.details.blueprint,
            name: 'loaded-blueprint',
            mode: 'image',
          },
        },
      };

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.output.distribution).toBe('rhel-9');
      expect(result.output.architecture).toBe('aarch64');
      expect(result.system.hostname).toBe('loaded-hostname');
      expect(result.filesystem.mode).toBe('advanced');
      expect(result.filesystem.disk.minsize).toBe('20');
      expect(result.compliance.type).toBe('openscap');
      expect(result.compliance.profileID).toBe(
        'xccdf_org.ssgproject.content_profile_cis',
      );
      expect(result.compliance.fips.enabled).toBe(true);
      expect(result.details.mode).toBe('edit');
      expect(result.details.blueprintId).toBe('bp-123');
      expect(result.details.blueprint.name).toBe('loaded-blueprint');
      expect(result.details.blueprint.mode).toBe('image');
    });

    it('should completely replace existing state', () => {
      const existingState: WizardState = {
        ...initialState,
        system: {
          ...initialState.system,
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
        },
      };

      const newState: WizardState = {
        ...initialState,
        system: {
          ...initialState.system,
          hostname: 'new-hostname',
          users: [],
        },
      };

      const result = wizardReducer(existingState, loadWizardState(newState));

      expect(result.system.hostname).toBe('new-hostname');
      expect(result.system.users).toEqual([]);
    });

    it('loadWizardState should fall back to initialState when system is missing', () => {
      const stateToLoad = {
        ...initialState,
        system: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.system).toEqual(initialState.system);
    });

    it('loadWizardState should fall back to initialState when filesystem is missing', () => {
      const stateToLoad = {
        ...initialState,
        filesystem: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.filesystem).toEqual(initialState.filesystem);
    });

    it('loadWizardState should fall back to initialState when compliance is missing', () => {
      const stateToLoad = {
        ...initialState,
        compliance: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.compliance).toEqual(initialState.compliance);
    });

    it('loadWizardState should fall back to initialState when details is missing', () => {
      const stateToLoad = {
        ...initialState,
        details: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.details).toEqual(initialState.details);
    });

    it('loadWizardState should fall back to initialState when output is missing', () => {
      const stateToLoad = {
        ...initialState,
        output: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.output).toEqual(initialState.output);
    });

    it('loadWizardState should fall back to initialState when cloudProviders is missing', () => {
      const stateToLoad = {
        ...initialState,
        cloudProviders: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.cloudProviders).toEqual(initialState.cloudProviders);
    });

    it('loadWizardState should fall back to initialState when registration is missing', () => {
      const stateToLoad = {
        ...initialState,
        registration: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.registration).toEqual(initialState.registration);
    });

    it('loadWizardState should fall back to initialState when content is missing', () => {
      const stateToLoad = {
        ...initialState,
        content: undefined,
      } as unknown as WizardState;

      const result = wizardReducer(initialState, loadWizardState(stateToLoad));

      expect(result.content).toEqual(initialState.content);
    });
  });

  describe('changeDistribution', () => {
    it('should update distribution', () => {
      const result = wizardReducer(initialState, changeDistribution('rhel-9'));

      expect(result.output.distribution).toBe('rhel-9');
    });
  });

  describe('changeArchitecture', () => {
    it('should update architecture', () => {
      const result = wizardReducer(initialState, changeArchitecture('aarch64'));

      expect(result.output.architecture).toBe('aarch64');
    });
  });

  describe('image type management', () => {
    describe('addImageType', () => {
      it('should add an image type to empty array', () => {
        const result = wizardReducer(initialState, addImageType('aws'));

        expect(result.output.imageTypes).toContain('aws');
        expect(result.output.imageTypes).toHaveLength(1);
      });

      it('should add multiple image types', () => {
        let state = wizardReducer(initialState, addImageType('aws'));
        state = wizardReducer(state, addImageType('gcp'));
        state = wizardReducer(state, addImageType('azure'));

        expect(state.output.imageTypes).toEqual(['aws', 'gcp', 'azure']);
      });

      it('should not add duplicate image types', () => {
        let state = wizardReducer(initialState, addImageType('aws'));
        state = wizardReducer(state, addImageType('aws'));

        expect(state.output.imageTypes).toEqual(['aws']);
      });
    });

    describe('removeImageType', () => {
      it('should remove an existing image type', () => {
        const stateWithTypes: WizardState = {
          ...initialState,
          output: {
            ...initialState.output,
            imageTypes: ['aws', 'gcp', 'azure'],
          },
        };

        const result = wizardReducer(stateWithTypes, removeImageType('gcp'));

        expect(result.output.imageTypes).toEqual(['aws', 'azure']);
      });

      it('should do nothing when removing non-existent type', () => {
        const stateWithTypes: WizardState = {
          ...initialState,
          output: {
            ...initialState.output,
            imageTypes: ['aws', 'gcp'],
          },
        };

        const result = wizardReducer(stateWithTypes, removeImageType('azure'));

        expect(result.output.imageTypes).toEqual(['aws', 'gcp']);
      });
    });

    describe('changeImageTypes', () => {
      it('should replace all image types', () => {
        const stateWithTypes: WizardState = {
          ...initialState,
          output: {
            ...initialState.output,
            imageTypes: ['aws', 'gcp'],
          },
        };

        const result = wizardReducer(
          stateWithTypes,
          changeImageTypes(['azure', 'vsphere']),
        );

        expect(result.output.imageTypes).toEqual(['azure', 'vsphere']);
      });

      it('should set empty array', () => {
        const stateWithTypes: WizardState = {
          ...initialState,
          output: {
            ...initialState.output,
            imageTypes: ['aws', 'gcp'],
          },
        };

        const result = wizardReducer(stateWithTypes, changeImageTypes([]));

        expect(result.output.imageTypes).toEqual([]);
      });

      it('should clear isoPayloadReference when bootable-container-iso is not selected', () => {
        const stateWithIso: WizardState = {
          ...initialState,
          output: {
            ...initialState.output,
            imageTypes: ['bootable-container-iso'],
            isoPayloadReference: 'registry.example.org/payload:latest',
          },
        };

        const result = wizardReducer(
          stateWithIso,
          changeImageTypes(['guest-image']),
        );

        expect(result.output.isoPayloadReference).toBeUndefined();
      });
    });
  });

  describe('clearLocale', () => {
    it('should reset languages and keyboard', () => {
      const stateWithLocale: WizardState = {
        ...initialState,
        system: {
          ...initialState.system,
          locale: {
            languages: ['en_US.UTF-8', 'fr_FR.UTF-8'],
            keyboard: 'us',
          },
        },
      };

      const result = wizardReducer(stateWithLocale, clearLocale());

      expect(result.system.locale.languages).toEqual([]);
      expect(result.system.locale.keyboard).toBe('');
    });

    it('should be a no-op on already empty locale state', () => {
      const result = wizardReducer(initialState, clearLocale());

      expect(result.system.locale.languages).toEqual([]);
      expect(result.system.locale.keyboard).toBe('');
    });
  });

  describe('clearTimezone', () => {
    it('should reset timezone and ntpservers', () => {
      const stateWithTimezone: WizardState = {
        ...initialState,
        system: {
          ...initialState.system,
          timezone: {
            timezone: 'America/New_York',
            ntpservers: ['0.pool.ntp.org', '1.pool.ntp.org'],
          },
        },
      };

      const result = wizardReducer(stateWithTimezone, clearTimezone());

      expect(result.system.timezone.timezone).toBe('');
      expect(result.system.timezone.ntpservers).toEqual([]);
    });

    it('should be a no-op on already empty timezone state', () => {
      const result = wizardReducer(initialState, clearTimezone());

      expect(result.system.timezone.timezone).toBe('');
      expect(result.system.timezone.ntpservers).toEqual([]);
    });
  });
});
