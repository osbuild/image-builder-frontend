import { describe, expect, it } from 'vitest';

import { ALL_CUSTOMIZATIONS } from '../../../store/distributions/constants';
import { computeRestrictions } from '../../../store/distributions/hooks';
import {
  CustomizationType,
  DistributionDetails,
  RestrictionStrategy,
} from '../../../store/distributions/types';
import isRhel from '../../../Utilities/isRhel';

const computeRestrictionStrategy = ({
  isImageMode,
  isOnPremise,
  distro = 'rhel-9',
}: {
  isImageMode: boolean;
  isOnPremise: boolean;
  distro?: string;
}) => {
  return computeRestrictions({
    imageTypes: {},
    context: {
      isImageMode,
      isOnPremise,
      isRhel: isRhel(distro),
    },
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

  describe('non-RHEL distribution restrictions', () => {
    it('should hide registration for non-RHEL distributions', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: false,
        distro: 'centos-9',
      });

      expect(result.registration.shouldHide).toBe(true);
      expect(result.registration.required).toBe(false);
    });

    it('should not hide registration for RHEL distributions', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: false,
        distro: 'rhel-9',
      });

      expect(result.registration.shouldHide).toBe(false);
    });

    it('should not hide other customizations for non-RHEL distributions', () => {
      const result = computeRestrictionStrategy({
        isImageMode: false,
        isOnPremise: false,
        distro: 'centos-9',
      });

      expect(result.packages.shouldHide).toBe(false);
      expect(result.filesystem.shouldHide).toBe(false);
      expect(result.users.shouldHide).toBe(false);
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

  describe('image type restrictions', () => {
    it('should hide customization when single image type does not support it', () => {
      // image-installer doesn't support filesystem
      const data: DistributionDetails = {
        name: 'rhel-9',
        architectures: {
          x86_64: {
            name: 'x86_64',
            image_types: {
              'image-installer': {
                name: 'image-installer',
                supported_blueprint_options: [
                  'packages',
                  'repositories',
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
                ],
              },
            },
          },
        },
      };

      const result = computeRestrictions({
        imageTypes: data.architectures!.x86_64.image_types!,
        context: {
          isImageMode: false,
          isOnPremise: false,
          isRhel: true,
        },
      });

      expect(result.filesystem.shouldHide).toBe(true);
      expect(result.packages.shouldHide).toBe(false);
    });

    it('should hide customization when no selected image types support it', () => {
      // Both wsl and image-installer don't support filesystem
      const data: DistributionDetails = {
        name: 'rhel-9',
        architectures: {
          x86_64: {
            name: 'x86_64',
            image_types: {
              'image-installer': {
                name: 'image-installer',
                supported_blueprint_options: ['packages', 'users'],
              },
              wsl: {
                name: 'wsl',
                supported_blueprint_options: ['packages', 'users'],
              },
            },
          },
        },
      };

      const result = computeRestrictions({
        imageTypes: data.architectures!.x86_64.image_types!,
        context: {
          isImageMode: false,
          isOnPremise: false,
          isRhel: true,
        },
      });

      // filesystem is not supported by either, should be hidden
      expect(result.filesystem.shouldHide).toBe(true);
      // packages is supported by both, should not be hidden
      expect(result.packages.shouldHide).toBe(false);
    });

    it('should show customization when at least one image type supports it', () => {
      // aws supports filesystem, image-installer doesn't
      const data: DistributionDetails = {
        name: 'rhel-9',
        architectures: {
          x86_64: {
            name: 'x86_64',
            image_types: {
              aws: {
                name: 'aws',
                supported_blueprint_options: [
                  'packages',
                  'filesystem',
                  'users',
                ],
              },
              'image-installer': {
                name: 'image-installer',
                supported_blueprint_options: ['packages', 'users'],
              },
            },
          },
        },
      };

      const result = computeRestrictions({
        imageTypes: data.architectures!.x86_64.image_types!,
        context: {
          isImageMode: false,
          isOnPremise: false,
          isRhel: true,
        },
      });

      // filesystem is supported by aws, should NOT be hidden
      expect(result.filesystem.shouldHide).toBe(false);
      // packages is supported by both
      expect(result.packages.shouldHide).toBe(false);
    });

    it('should hide most customizations for network-installer', () => {
      // network-installer only supports locale and fips
      const data: DistributionDetails = {
        name: 'rhel-9',
        architectures: {
          x86_64: {
            name: 'x86_64',
            image_types: {
              'network-installer': {
                name: 'network-installer',
                supported_blueprint_options: ['locale', 'fips'],
              },
            },
          },
        },
      };

      const result = computeRestrictions({
        imageTypes: data.architectures!.x86_64.image_types!,
        context: {
          isImageMode: false,
          isOnPremise: false,
          isRhel: true,
        },
      });

      // Only locale and fips should be visible
      expect(result.locale.shouldHide).toBe(false);
      expect(result.fips.shouldHide).toBe(false);

      // Everything else should be hidden
      expect(result.packages.shouldHide).toBe(true);
      expect(result.filesystem.shouldHide).toBe(true);
      expect(result.kernel.shouldHide).toBe(true);
      expect(result.users.shouldHide).toBe(true);
    });

    it('should handle image type with undefined supported_blueprint_options alongside one that defines it', () => {
      // aws has supported_blueprint_options with filesystem & packages,
      // gcp has undefined supported_blueprint_options (meaning it supports ALL)
      const data: DistributionDetails = {
        name: 'rhel-9',
        architectures: {
          x86_64: {
            name: 'x86_64',
            image_types: {
              aws: {
                name: 'aws',
                supported_blueprint_options: ['filesystem', 'packages'],
              },
              gcp: {
                name: 'gcp',
                // supported_blueprint_options is intentionally omitted (undefined)
                // This means gcp supports ALL customizations
              },
            },
          },
        },
      };

      const result = computeRestrictions({
        imageTypes: data.architectures!.x86_64.image_types!,
        context: {
          isImageMode: false,
          isOnPremise: false,
          isRhel: true,
        },
      });

      // When at least one image type has undefined supported_blueprint_options,
      // it supports all customizations, so nothing should be hidden
      for (const customization of getAllCustomizationTypes()) {
        expect(result[customization].shouldHide).toBe(false);
      }
    });

    it('should not hide any customizations when image_types is an empty object', () => {
      // Empty image_types means no image types are selected yet,
      // so we should fall back to showing all customizations
      const data: DistributionDetails = {
        name: 'rhel-9',
        architectures: {
          x86_64: {
            name: 'x86_64',
            image_types: {},
          },
        },
      };

      const result = computeRestrictions({
        imageTypes: data.architectures!.x86_64.image_types!,
        context: {
          isImageMode: false,
          isOnPremise: false,
          isRhel: true,
        },
      });

      // All customizations should be visible when no image types are selected
      for (const customization of getAllCustomizationTypes()) {
        expect(result[customization].shouldHide).toBe(false);
        expect(result[customization].required).toBe(false);
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
      'registration',
      'users',
      'fips',
      'aap',
    ];

    expect([...ALL_CUSTOMIZATIONS]).toEqual(expectedTypes);
  });

  it('should have 15 customization types', () => {
    expect(ALL_CUSTOMIZATIONS).toHaveLength(15);
  });
});
