import { describe, expect, it } from 'vitest';

import {
  ALL_CUSTOMIZATION_TYPES,
  CustomizationType,
  RESTRICTED_IMAGE_TYPES,
} from '../../../store/restrictions/types';

/**
 * Helper function to compute customization restrictions.
 * This mirrors the logic in restrictedCustomizationsApi.ts but is extracted
 * for easier unit testing without needing to set up the full RTK Query infrastructure.
 *
 * IMPORTANT: RESTRICTED_IMAGE_TYPES contains the list of customizations that ARE
 * **supported/allowed** for each image type. Image types not in this mapping
 * support all customizations (no restrictions).
 */
const computeRestrictions = (
  selectedImageTypes: string[],
): Record<CustomizationType, boolean> => {
  const isAllowed: Record<CustomizationType, boolean> = {} as Record<
    CustomizationType,
    boolean
  >;

  for (const customization of ALL_CUSTOMIZATION_TYPES) {
    // Find image types that do NOT support this customization
    const unsupportedTypes = selectedImageTypes.filter((imageType) => {
      const supportedCustomizations =
        RESTRICTED_IMAGE_TYPES[
          imageType as keyof typeof RESTRICTED_IMAGE_TYPES
        ];

      // If this image type has no entry in RESTRICTED_IMAGE_TYPES,
      // it supports all customizations (no restrictions)
      if (!supportedCustomizations) return false;

      // Return true if this customization is NOT in the supported list
      return !supportedCustomizations.includes(customization);
    });

    // Customization is allowed only if ALL selected image types support it
    isAllowed[customization] = unsupportedTypes.length === 0;
  }

  return isAllowed;
};

describe('restrictedCustomizationsApi', () => {
  describe('computeRestrictions', () => {
    describe('unrestricted image types', () => {
      it('should allow all customizations for image types without restrictions', () => {
        const result = computeRestrictions(['ami']);

        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          expect(result[customization]).toBe(true);
        }
      });

      it('should allow all customizations for guest-image', () => {
        const result = computeRestrictions(['guest-image']);

        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          expect(result[customization]).toBe(true);
        }
      });

      it('should allow all customizations for multiple unrestricted types', () => {
        const result = computeRestrictions(['ami', 'guest-image', 'vhd']);

        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          expect(result[customization]).toBe(true);
        }
      });
    });

    describe('network-installer restrictions', () => {
      it('should only allow locale and fips for network-installer', () => {
        const result = computeRestrictions(['network-installer']);

        // network-installer only supports locale and fips
        expect(result.locale).toBe(true);
        expect(result.fips).toBe(true);

        // All others should be restricted (not allowed)
        const restrictedCustomizations = ALL_CUSTOMIZATION_TYPES.filter(
          (c) => c !== 'locale' && c !== 'fips',
        );
        for (const customization of restrictedCustomizations) {
          expect(result[customization]).toBe(false);
        }
      });
    });

    describe('image-installer restrictions', () => {
      it('should allow all customizations except filesystem for image-installer', () => {
        const result = computeRestrictions(['image-installer']);

        // filesystem should be restricted (not in the supported list)
        expect(result.filesystem).toBe(false);

        // All others should be allowed
        const allowedCustomizations = ALL_CUSTOMIZATION_TYPES.filter(
          (c) => c !== 'filesystem',
        );
        for (const customization of allowedCustomizations) {
          expect(result[customization]).toBe(true);
        }
      });
    });

    describe('wsl restrictions', () => {
      it('should allow all customizations except filesystem and kernel for wsl', () => {
        const result = computeRestrictions(['wsl']);

        // filesystem and kernel should be restricted
        expect(result.filesystem).toBe(false);
        expect(result.kernel).toBe(false);

        // All others should be allowed
        const allowedCustomizations = ALL_CUSTOMIZATION_TYPES.filter(
          (c) => c !== 'filesystem' && c !== 'kernel',
        );
        for (const customization of allowedCustomizations) {
          expect(result[customization]).toBe(true);
        }
      });
    });

    describe('multiple image types', () => {
      it('should use the intersection of allowed customizations for multiple types', () => {
        // ami allows everything, network-installer only allows locale and fips
        // Intersection: only locale and fips are allowed
        const result = computeRestrictions(['ami', 'network-installer']);

        // Only locale and fips should be allowed (intersection)
        expect(result.locale).toBe(true);
        expect(result.fips).toBe(true);

        // Everything else should be restricted
        expect(result.packages).toBe(false);
        expect(result.filesystem).toBe(false);
        expect(result.kernel).toBe(false);
        expect(result.users).toBe(false);
      });

      it('should restrict filesystem when mixing wsl and image-installer', () => {
        // wsl: allows everything except filesystem & kernel
        // image-installer: allows everything except filesystem
        // Intersection: everything except filesystem (both restrict it), and kernel (wsl restricts it)
        const result = computeRestrictions(['wsl', 'image-installer']);

        // filesystem is restricted by both
        expect(result.filesystem).toBe(false);

        // kernel is restricted by wsl
        expect(result.kernel).toBe(false);

        // Other customizations are allowed by both
        expect(result.packages).toBe(true);
        expect(result.users).toBe(true);
        expect(result.hostname).toBe(true);
      });

      it('should use most restrictive intersection when image-installer and network-installer are combined', () => {
        // image-installer: allows everything except filesystem
        // network-installer: only allows locale and fips
        // Intersection: only locale and fips (but not filesystem, which network-installer doesn't support anyway)
        const result = computeRestrictions([
          'image-installer',
          'network-installer',
        ]);

        // Only locale and fips are allowed by both
        expect(result.locale).toBe(true);
        expect(result.fips).toBe(true);

        // Everything else is restricted
        expect(result.filesystem).toBe(false);
        expect(result.packages).toBe(false);
        expect(result.kernel).toBe(false);
        expect(result.users).toBe(false);
      });

      it('should allow all when combining only unrestricted types', () => {
        const result = computeRestrictions(['ami', 'guest-image', 'vhd']);

        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          expect(result[customization]).toBe(true);
        }
      });
    });

    describe('edge cases', () => {
      it('should allow all customizations for empty image types array', () => {
        const result = computeRestrictions([]);

        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          expect(result[customization]).toBe(true);
        }
      });

      it('should handle unknown image types gracefully (treat as unrestricted)', () => {
        const result = computeRestrictions(['unknown-type']);

        // Unknown types should be treated as having no restrictions
        for (const customization of ALL_CUSTOMIZATION_TYPES) {
          expect(result[customization]).toBe(true);
        }
      });

      it('should apply restrictions when mixing unknown and restricted types', () => {
        // unknown-type has no restrictions, network-installer only allows locale and fips
        const result = computeRestrictions([
          'unknown-type',
          'network-installer',
        ]);

        // Intersection with network-installer means only locale and fips allowed
        expect(result.locale).toBe(true);
        expect(result.fips).toBe(true);
        expect(result.packages).toBe(false);
        expect(result.filesystem).toBe(false);
      });
    });
  });
});

describe('RESTRICTED_IMAGE_TYPES configuration', () => {
  it('should have network-installer supporting only locale and fips', () => {
    expect(RESTRICTED_IMAGE_TYPES['network-installer']).toEqual([
      'locale',
      'fips',
    ]);
  });

  it('should have image-installer supporting all customizations except filesystem', () => {
    const imageInstallerSupported = RESTRICTED_IMAGE_TYPES['image-installer'];

    // Should contain all types except filesystem
    expect(imageInstallerSupported).not.toContain('filesystem');
    expect(imageInstallerSupported).toContain('packages');
    expect(imageInstallerSupported).toContain('kernel');
    expect(imageInstallerSupported).toContain('users');
    expect(imageInstallerSupported).toContain('locale');
    expect(imageInstallerSupported).toContain('fips');

    // Should have length of ALL_CUSTOMIZATION_TYPES - 1 (minus filesystem)
    expect(imageInstallerSupported).toHaveLength(
      ALL_CUSTOMIZATION_TYPES.length - 1,
    );
  });

  it('should have wsl supporting all customizations except filesystem and kernel', () => {
    const wslSupported = RESTRICTED_IMAGE_TYPES['wsl'];

    // Should not contain filesystem and kernel
    expect(wslSupported).not.toContain('filesystem');
    expect(wslSupported).not.toContain('kernel');

    // Should contain other types
    expect(wslSupported).toContain('packages');
    expect(wslSupported).toContain('users');
    expect(wslSupported).toContain('locale');

    // Should have length of ALL_CUSTOMIZATION_TYPES - 2 (minus filesystem and kernel)
    expect(wslSupported).toHaveLength(ALL_CUSTOMIZATION_TYPES.length - 2);
  });
});

describe('ALL_CUSTOMIZATION_TYPES', () => {
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

    expect(ALL_CUSTOMIZATION_TYPES).toEqual(expectedTypes);
  });

  it('should have 14 customization types', () => {
    expect(ALL_CUSTOMIZATION_TYPES).toHaveLength(14);
  });
});
