import { describe, expect, it } from 'vitest';

import { ImageTypes } from '../../../store/imageBuilderApi';
import {
  ALL_CUSTOMIZATION_TYPES,
  CustomizationType,
  RESTRICTED_IMAGE_TYPES,
  RestrictionStrategy,
} from '../../../store/restrictions/types';

/**
 * Helper function to compute the restriction strategy.
 * This mirrors the transformation logic in hooks.tsx but is extracted
 * for easier unit testing without needing to set up React hooks and Redux.
 */
const computeRestrictionStrategy = ({
  isAllowed,
  isImageMode,
  isOnPremise,
  isSingleTarget,
  selectedImageTypes,
}: {
  isAllowed: Record<CustomizationType, boolean>;
  isImageMode: boolean;
  isOnPremise: boolean;
  isSingleTarget: boolean;
  selectedImageTypes: ImageTypes[];
}): Record<CustomizationType, RestrictionStrategy> => {
  const restrictions: Record<CustomizationType, RestrictionStrategy> =
    {} as Record<CustomizationType, RestrictionStrategy>;

  for (const customization of ALL_CUSTOMIZATION_TYPES) {
    let allowed = isAllowed[customization];

    if (isImageMode) {
      // users & filesystem are the only allowed customizations for image mode
      allowed = ['filesystem', 'users'].includes(customization);
      restrictions[customization] = {
        isAllowed: allowed,
        shouldHide: !allowed,
        // this can be empty since there are no steps that
        // might have conflicting customizations
        supportedImageTypes: [],
        // users is required for image-mode
        required: customization === 'users',
      };
      continue;
    }

    if (
      isOnPremise &&
      // on-premise doesn't allow first boot & repository
      // customizations just yet
      ['repositories', 'firstBoot'].includes(customization)
    ) {
      restrictions[customization] = {
        isAllowed: false,
        shouldHide: true,
        // these are hidden, so we can leave this empty
        supportedImageTypes: [],
        required: false,
      };
      continue;
    }

    const supportedImageTypes = selectedImageTypes.filter((imageType) => {
      // this image supports this specific customization
      // so we want it in the list of supported image types
      // for the customization
      if (!RESTRICTED_IMAGE_TYPES[imageType]) return true;

      return RESTRICTED_IMAGE_TYPES[imageType].includes(customization);
    });

    restrictions[customization] = {
      isAllowed: allowed,
      shouldHide: !allowed && isSingleTarget,
      supportedImageTypes,
      required: false,
    };
  }

  return restrictions;
};

// Helper to create a default "all allowed" record
const createAllAllowed = (): Record<CustomizationType, boolean> => {
  const result: Record<CustomizationType, boolean> = {} as Record<
    CustomizationType,
    boolean
  >;
  for (const c of ALL_CUSTOMIZATION_TYPES) {
    result[c] = true;
  }
  return result;
};

describe('useGetCustomizationRestrictionsQuery hook logic', () => {
  describe('shouldHide logic', () => {
    it('should set shouldHide=true when single target and not allowed', () => {
      const isAllowed = createAllAllowed();
      isAllowed.packages = false;

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      expect(result.packages.isAllowed).toBe(false);
      expect(result.packages.shouldHide).toBe(true);
    });

    it('should set shouldHide=false when multiple targets and not allowed', () => {
      const isAllowed = createAllAllowed();
      isAllowed.packages = false;

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: false,
        selectedImageTypes: ['ami', 'guest-image'],
      });

      expect(result.packages.isAllowed).toBe(false);
      expect(result.packages.shouldHide).toBe(false);
    });

    it('should set shouldHide=false when allowed', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      expect(result.packages.isAllowed).toBe(true);
      expect(result.packages.shouldHide).toBe(false);
    });
  });

  describe('supportedImageTypes logic', () => {
    it('should include all selected image types when customization is supported by all', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: false,
        selectedImageTypes: ['ami', 'guest-image'],
      });

      // packages is supported by both ami and guest-image (unrestricted types)
      expect(result.packages.supportedImageTypes).toEqual([
        'ami',
        'guest-image',
      ]);
    });

    it('should filter out image types that do not support the customization', () => {
      const isAllowed = createAllAllowed();
      isAllowed.filesystem = false; // wsl doesn't support filesystem

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: false,
        selectedImageTypes: ['ami', 'wsl'],
      });

      // ami supports filesystem, wsl does not
      expect(result.filesystem.supportedImageTypes).toEqual(['ami']);
    });

    it('should return empty array when no image types support the customization', () => {
      const isAllowed = createAllAllowed();
      isAllowed.packages = false; // network-installer doesn't support packages

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['network-installer'],
      });

      // network-installer only supports locale and fips
      expect(result.packages.supportedImageTypes).toEqual([]);
    });

    it('should correctly identify supported types for mixed selections', () => {
      const isAllowed = createAllAllowed();
      isAllowed.kernel = false; // wsl doesn't support kernel

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: false,
        selectedImageTypes: ['ami', 'wsl', 'guest-image'],
      });

      // ami and guest-image support kernel, wsl does not
      expect(result.kernel.supportedImageTypes).toEqual(['ami', 'guest-image']);
    });
  });

  describe('image mode restrictions', () => {
    it('should only allow filesystem and users customizations in image mode', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: true,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      // filesystem and users should be allowed
      expect(result.filesystem.isAllowed).toBe(true);
      expect(result.filesystem.shouldHide).toBe(false);
      expect(result.users.isAllowed).toBe(true);
      expect(result.users.shouldHide).toBe(false);

      // All others should be disallowed
      const allowedInImageMode = ['filesystem', 'users'];
      const restrictedTypes = ALL_CUSTOMIZATION_TYPES.filter(
        (c) => !allowedInImageMode.includes(c),
      );
      for (const customization of restrictedTypes) {
        expect(result[customization].isAllowed).toBe(false);
        expect(result[customization].shouldHide).toBe(true);
      }
    });

    it('should set supportedImageTypes to empty array in image mode', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: true,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      // In image mode, supportedImageTypes is always empty
      for (const customization of ALL_CUSTOMIZATION_TYPES) {
        expect(result[customization].supportedImageTypes).toEqual([]);
      }
    });

    it('should mark users as required in image mode', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: true,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      // Users should be required in image mode
      expect(result.users.required).toBe(true);

      // Other customizations should not be required
      const nonUserTypes = ALL_CUSTOMIZATION_TYPES.filter((c) => c !== 'users');
      for (const customization of nonUserTypes) {
        expect(result[customization].required).toBe(false);
      }
    });

    it('should not mark users as required when not in image mode', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      expect(result.users.required).toBe(false);
    });

    it('should always hide in image mode regardless of target count', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: true,
        isOnPremise: false,
        isSingleTarget: false,
        selectedImageTypes: ['ami', 'guest-image'],
      });

      // In image mode, we always hide unsupported customizations
      expect(result.packages.shouldHide).toBe(true);
      expect(result.packages.supportedImageTypes).toEqual([]);
    });
  });

  describe('on-premise restrictions', () => {
    it('should disallow repositories and firstBoot on premise', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: true,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      expect(result.repositories.isAllowed).toBe(false);
      expect(result.repositories.shouldHide).toBe(true);
      expect(result.repositories.supportedImageTypes).toEqual([]);
      expect(result.firstBoot.isAllowed).toBe(false);
      expect(result.firstBoot.shouldHide).toBe(true);
      expect(result.firstBoot.supportedImageTypes).toEqual([]);
    });

    it('should allow other customizations on premise', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: true,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      // These should still be allowed
      expect(result.packages.isAllowed).toBe(true);
      expect(result.filesystem.isAllowed).toBe(true);
      expect(result.kernel.isAllowed).toBe(true);
      expect(result.users.isAllowed).toBe(true);
      expect(result.hostname.isAllowed).toBe(true);
    });
  });

  describe('combined restrictions', () => {
    it('should combine image mode and on-premise restrictions', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: true,
        isOnPremise: true,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      // Image mode allows filesystem and users
      expect(result.filesystem.isAllowed).toBe(true);
      expect(result.users.isAllowed).toBe(true);

      // Everything else should be disallowed
      expect(result.packages.isAllowed).toBe(false);
      expect(result.repositories.isAllowed).toBe(false);
      expect(result.firstBoot.isAllowed).toBe(false);

      // Users should be marked as required in image mode
      expect(result.users.required).toBe(true);
    });

    it('should combine base restrictions with image mode restrictions', () => {
      const isAllowed = createAllAllowed();
      isAllowed.locale = false; // e.g., restricted by some image type

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: true,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      // filesystem and users are allowed in image mode
      expect(result.filesystem.isAllowed).toBe(true);
      expect(result.users.isAllowed).toBe(true);

      // locale was already disallowed, and image mode also disallows it
      expect(result.locale.isAllowed).toBe(false);

      // packages is disallowed by image mode
      expect(result.packages.isAllowed).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle all customizations being disallowed', () => {
      const isAllowed: Record<CustomizationType, boolean> = {} as Record<
        CustomizationType,
        boolean
      >;
      for (const c of ALL_CUSTOMIZATION_TYPES) {
        isAllowed[c] = false;
      }

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      for (const customization of ALL_CUSTOMIZATION_TYPES) {
        expect(result[customization].isAllowed).toBe(false);
        expect(result[customization].shouldHide).toBe(true);
      }
    });

    it('should handle all customizations being allowed', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: true,
        selectedImageTypes: ['ami'],
      });

      for (const customization of ALL_CUSTOMIZATION_TYPES) {
        expect(result[customization].isAllowed).toBe(true);
        expect(result[customization].shouldHide).toBe(false);
        expect(result[customization].required).toBe(false);
      }
    });

    it('should handle empty selected image types', () => {
      const isAllowed = createAllAllowed();

      const result = computeRestrictionStrategy({
        isAllowed,
        isImageMode: false,
        isOnPremise: false,
        isSingleTarget: false,
        selectedImageTypes: [],
      });

      // With no selected image types, supportedImageTypes should be empty
      for (const customization of ALL_CUSTOMIZATION_TYPES) {
        expect(result[customization].supportedImageTypes).toEqual([]);
      }
    });
  });
});

describe('RestrictionStrategy type', () => {
  it('should have correct structure', () => {
    const strategy: RestrictionStrategy = {
      isAllowed: true,
      shouldHide: false,
      supportedImageTypes: ['ami', 'guest-image'],
      required: false,
    };

    expect(strategy).toHaveProperty('isAllowed');
    expect(strategy).toHaveProperty('shouldHide');
    expect(strategy).toHaveProperty('supportedImageTypes');
    expect(strategy).toHaveProperty('required');
  });
});
