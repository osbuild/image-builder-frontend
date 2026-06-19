import { describe, expect, it } from 'vitest';

import {
  combinedInitialState as initialState,
  selectBlueprintMode,
  selectIsImageMode,
} from '@/store/slices/wizard';

import { createMockState } from './mockWizardState';

describe('wizard selectors', () => {
  describe('selectIsImageMode (computed selector)', () => {
    it('should return true when blueprintMode is "image"', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'image' },
        },
      });

      expect(selectIsImageMode(state)).toBe(true);
    });

    it('should return false when blueprintMode is "package"', () => {
      const state = createMockState({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'package' },
        },
      });

      expect(selectIsImageMode(state)).toBe(false);
    });

    it('should be derived from selectBlueprintMode', () => {
      const imageState = createMockState({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'image' },
        },
      });
      const packageState = createMockState({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'package' },
        },
      });

      // Verify the relationship between the base selector and derived selector
      expect(selectBlueprintMode(imageState)).toBe('image');
      expect(selectIsImageMode(imageState)).toBe(true);

      expect(selectBlueprintMode(packageState)).toBe('package');
      expect(selectIsImageMode(packageState)).toBe(false);
    });
  });
});
