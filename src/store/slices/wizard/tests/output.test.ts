import { describe, expect, it } from 'vitest';

import type { BootcDistributionItem } from '@/store/api/backend';
import {
  addImageType,
  changeArchitecture,
  changeBootcDistributions,
  changeDistribution,
  changeImageSource,
  changeImageTypes,
  changeIsoPayloadReference,
  initialState,
  removeImageType,
  selectArchitecture,
  selectBootcDistributions,
  selectDistribution,
  selectImageSource,
  selectImageTypes,
  selectIsoPayloadReference,
  wizardReducer,
  type WizardState,
} from '@/store/slices/wizard';

import { createMockState } from './mockWizardState';

describe('output reducers', () => {
  describe('changeImageSource', () => {
    it('should update image source', () => {
      const result = wizardReducer(
        initialState,
        changeImageSource('quay.io/org/image:latest'),
      );

      expect(result.output.imageSource).toBe('quay.io/org/image:latest');
    });

    it('should clear image source with undefined', () => {
      const stateWithSource: WizardState = {
        ...initialState,
        output: {
          ...initialState.output,
          imageSource: 'quay.io/org/image:latest',
        },
      };

      const result = wizardReducer(
        stateWithSource,
        changeImageSource(undefined),
      );

      expect(result.output.imageSource).toBeUndefined();
    });
  });

  describe('changeIsoPayloadReference', () => {
    it('should update iso payload reference', () => {
      const result = wizardReducer(
        initialState,
        changeIsoPayloadReference('registry.example.org/payload:latest'),
      );

      expect(result.output.isoPayloadReference).toBe(
        'registry.example.org/payload:latest',
      );
    });

    it('should clear iso payload reference with undefined', () => {
      const stateWithRef: WizardState = {
        ...initialState,
        output: {
          ...initialState.output,
          isoPayloadReference: 'registry.example.org/payload:latest',
        },
      };

      const result = wizardReducer(
        stateWithRef,
        changeIsoPayloadReference(undefined),
      );

      expect(result.output.isoPayloadReference).toBeUndefined();
    });
  });

  describe('changeBootcDistributions', () => {
    it('should update bootc distributions', () => {
      const distributions = [
        {
          distro: 'rhel-10',
          name: 'distro-1',
          reference: 'ref-1',
          type: 'guest-image',
          arch: 'x86_64',
        },
      ] satisfies BootcDistributionItem[];

      const result = wizardReducer(
        initialState,
        changeBootcDistributions(distributions),
      );

      expect(result.output.bootcDistributions).toEqual(distributions);
    });
  });

  describe('changeArchitecture', () => {
    it('should update architecture under output', () => {
      const result = wizardReducer(initialState, changeArchitecture('aarch64'));

      expect(result.output.architecture).toBe('aarch64');
    });
  });

  describe('changeDistribution', () => {
    it('should update distribution under output', () => {
      const result = wizardReducer(initialState, changeDistribution('rhel-9'));

      expect(result.output.distribution).toBe('rhel-9');
    });
  });

  describe('addImageType', () => {
    it('should add an image type under output', () => {
      const result = wizardReducer(initialState, addImageType('aws'));

      expect(result.output.imageTypes).toContain('aws');
      expect(result.output.imageTypes).toHaveLength(1);
    });

    it('should not add duplicate image types', () => {
      let state = wizardReducer(initialState, addImageType('aws'));
      state = wizardReducer(state, addImageType('aws'));

      expect(state.output.imageTypes).toEqual(['aws']);
    });
  });

  describe('removeImageType', () => {
    it('should remove an existing image type from output', () => {
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
  });

  describe('changeImageTypes', () => {
    it('should replace all image types under output', () => {
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

    it('should preserve isoPayloadReference when bootable-container-iso is selected', () => {
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
        changeImageTypes(['bootable-container-iso', 'guest-image']),
      );

      expect(result.output.isoPayloadReference).toBe(
        'registry.example.org/payload:latest',
      );
    });
  });
});

describe('output selectors', () => {
  describe('selectImageSource', () => {
    it('should return imageSource from output', () => {
      const state = createMockState({
        output: {
          ...initialState.output,
          imageSource: 'quay.io/org/image:latest',
        },
      });

      expect(selectImageSource(state)).toBe('quay.io/org/image:latest');
    });

    it('should return undefined when not set', () => {
      const state = createMockState({});

      expect(selectImageSource(state)).toBeUndefined();
    });
  });

  describe('selectIsoPayloadReference', () => {
    it('should return isoPayloadReference from output', () => {
      const state = createMockState({
        output: {
          ...initialState.output,
          isoPayloadReference: 'registry.example.org/payload:latest',
        },
      });

      expect(selectIsoPayloadReference(state)).toBe(
        'registry.example.org/payload:latest',
      );
    });
  });

  describe('selectBootcDistributions', () => {
    it('should return bootcDistributions from output', () => {
      const distributions = [
        {
          distro: 'rhel-10',
          name: 'distro-1',
          reference: 'ref-1',
          type: 'guest-image',
          arch: 'x86_64',
        },
      ] satisfies BootcDistributionItem[];
      const state = createMockState({
        output: {
          ...initialState.output,
          bootcDistributions: distributions,
        },
      });

      expect(selectBootcDistributions(state)).toEqual(distributions);
    });
  });

  describe('selectArchitecture', () => {
    it('should return architecture from output', () => {
      const state = createMockState({
        output: {
          ...initialState.output,
          architecture: 'aarch64',
        },
      });

      expect(selectArchitecture(state)).toBe('aarch64');
    });
  });

  describe('selectDistribution', () => {
    it('should return distribution from output', () => {
      const state = createMockState({
        output: {
          ...initialState.output,
          distribution: 'rhel-9',
        },
      });

      expect(selectDistribution(state)).toBe('rhel-9');
    });
  });

  describe('selectImageTypes', () => {
    it('should return imageTypes from output', () => {
      const state = createMockState({
        output: {
          ...initialState.output,
          imageTypes: ['aws', 'gcp'],
        },
      });

      expect(selectImageTypes(state)).toEqual(['aws', 'gcp']);
    });
  });
});
