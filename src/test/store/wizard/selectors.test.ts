import { describe, expect, it } from 'vitest';

import { selectBlueprintMode, selectIsImageMode } from '@/store/wizardSlice';

import { createMockState } from './mockWizardState';

describe('wizard selectors', () => {
  describe('selectIsImageMode (computed selector)', () => {
    it('should return true when blueprintMode is "image"', () => {
      const state = createMockState({ blueprintMode: 'image' });

      expect(selectIsImageMode(state)).toBe(true);
    });

    it('should return false when blueprintMode is "package"', () => {
      const state = createMockState({ blueprintMode: 'package' });

      expect(selectIsImageMode(state)).toBe(false);
    });

    it('should be derived from selectBlueprintMode', () => {
      const imageState = createMockState({ blueprintMode: 'image' });
      const packageState = createMockState({ blueprintMode: 'package' });

      // Verify the relationship between the base selector and derived selector
      expect(selectBlueprintMode(imageState)).toBe('image');
      expect(selectIsImageMode(imageState)).toBe(true);

      expect(selectBlueprintMode(packageState)).toBe('package');
      expect(selectIsImageMode(packageState)).toBe(false);
    });
  });
});
