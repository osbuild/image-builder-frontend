import { describe, expect, it } from 'vitest';

import { ALL_CUSTOMIZATIONS } from '../../../store/distributions/constants';
import { computeRestrictions } from '../../../store/distributions/hooks';
import {
  CustomizationType,
  RestrictionStrategy,
} from '../../../store/distributions/types';

const computeRestrictionStrategy = ({
  isImageMode,
  isOnPremise,
}: {
  isImageMode: boolean;
  isOnPremise: boolean;
}) => {
  return computeRestrictions({
    isImageMode,
    isOnPremise,
    isSingleTarget: false,
    arch: 'x86_64',
    data: undefined,
  });
};

// Helper to get all customization types as an array
const getAllCustomizationTypes = (): CustomizationType[] => [
  ...ALL_CUSTOMIZATIONS,
];

describe('useCustomizationRestrictions hook logic', () => {
  describe('default behavior (package mode, not on-premise)', () => {
    it('should not hide any customizations by default', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: false,
      });

      for (const customization of getAllCustomizationTypes()) {
        expect(result[customization].shouldHide).toBe(false);
        expect(result[customization].required).toBe(false);
      }
    });
  });

  describe('image mode restrictions', () => {
    it('should only allow filesystem and users customizations in image mode', () => {
      const result = computeRestrictionStrategy({
        isImageMode: true,
        isOnPremise: false,
      });

      // filesystem and users should not be hidden
      expect(result.filesystem.shouldHide).toBe(false);
      expect(result.users.shouldHide).toBe(false);

      // All others should be hidden
      const allowedInImageMode = ['filesystem', 'users'];
      const hiddenTypes = getAllCustomizationTypes().filter(
        (c) => !allowedInImageMode.includes(c),
      );
      for (const customization of hiddenTypes) {
        expect(result[customization].shouldHide).toBe(true);
      }
    });

    it('should mark users as required in image mode', () => {
      const result = computeRestrictionStrategy({
        isImageMode: true,
        isOnPremise: false,
      });

      // Users should be required in image mode
      expect(result.users.required).toBe(true);

      // Other customizations should not be required
      const nonUserTypes = getAllCustomizationTypes().filter(
        (c) => c !== 'users',
      );
      for (const customization of nonUserTypes) {
        expect(result[customization].required).toBe(false);
      }
    });

    it('should not mark users as required when not in image mode', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: false,
      });

      expect(result.users.required).toBe(false);
    });
  });

  describe('on-premise restrictions', () => {
    it('should hide repositories and firstBoot on premise', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: true,
      });

      expect(result.repositories.shouldHide).toBe(true);
      expect(result.firstBoot.shouldHide).toBe(true);
    });

    it('should allow other customizations on premise', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: true,
      });

      // These should not be hidden
      expect(result.packages.shouldHide).toBe(false);
      expect(result.filesystem.shouldHide).toBe(false);
      expect(result.kernel.shouldHide).toBe(false);
      expect(result.users.shouldHide).toBe(false);
      expect(result.hostname.shouldHide).toBe(false);
    });
  });

  describe('combined restrictions', () => {
    it('should combine image mode and on-premise restrictions', () => {
      const result = computeRestrictionStrategy({
        isImageMode: true,
        isOnPremise: true,
      });

      // Image mode allows filesystem and users (image mode takes precedence)
      expect(result.filesystem.shouldHide).toBe(false);
      expect(result.users.shouldHide).toBe(false);

      // Everything else should be hidden by image mode
      expect(result.packages.shouldHide).toBe(true);
      expect(result.repositories.shouldHide).toBe(true);
      expect(result.firstBoot.shouldHide).toBe(true);

      // Users should be marked as required in image mode
      expect(result.users.required).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle all customization types', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: false,
      });

      // Verify all customization types are present
      for (const customization of getAllCustomizationTypes()) {
        expect(result[customization]).toBeDefined();
        expect(result[customization]).toHaveProperty('shouldHide');
        expect(result[customization]).toHaveProperty('required');
      }
    });
  });
});

describe('RestrictionStrategy type', () => {
  it('should have correct structure', () => {
    const strategy: RestrictionStrategy = {
      shouldHide: false,
      required: false,
    };

    expect(strategy).toHaveProperty('shouldHide');
    expect(strategy).toHaveProperty('required');
  });
});

describe('ALL_CUSTOMIZATIONS', () => {
  it('should contain all expected customization types', () => {
    const expectedTypes: CustomizationType[] = [
      'packages',
      'repositories',
      'filesystem',
      'kernel',
      'timezone',
      'locale',
      'firewall',
      'services',
      'hostname',
      'firstBoot',
      'openscap',
      'users',
      'fips',
      'aap',
    ];

    expect([...ALL_CUSTOMIZATIONS]).toEqual(expectedTypes);
  });

  it('should have 14 customization types', () => {
    expect(ALL_CUSTOMIZATIONS).toHaveLength(14);
  });
});
