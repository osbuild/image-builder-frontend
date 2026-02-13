import { describe, expect, it } from 'vitest';

import { ALL_CUSTOMIZATIONS } from '../../../store/distributions/constants';
import {
  computeImageTypeCustomizationSupport,
  computeRestrictions,
  isCustomizationSupported,
  SupportContext,
} from '../../../store/distributions/hooks';
import {
  CustomizationType,
  DistributionDetails,
  ImageTypeInfo,
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

describe('isCustomizationSupported', () => {
  describe('image mode restrictions', () => {
    const imageModeCxt: SupportContext = {
      isImageMode: true,
      isOnPremise: false,
      isRhel: true,
    };

    it('should only allow filesystem and users in image mode', () => {
      expect(
        isCustomizationSupported('filesystem', undefined, imageModeCxt),
      ).toBe(true);
      expect(isCustomizationSupported('users', undefined, imageModeCxt)).toBe(
        true,
      );
    });

    it('should hide other customizations in image mode', () => {
      expect(
        isCustomizationSupported('packages', undefined, imageModeCxt),
      ).toBe(false);
      expect(isCustomizationSupported('kernel', undefined, imageModeCxt)).toBe(
        false,
      );
      expect(
        isCustomizationSupported('repositories', undefined, imageModeCxt),
      ).toBe(false);
      expect(
        isCustomizationSupported('registration', undefined, imageModeCxt),
      ).toBe(false);
    });
  });

  describe('on-premise restrictions', () => {
    const onPremiseCtx: SupportContext = {
      isImageMode: false,
      isOnPremise: true,
      isRhel: true,
    };

    it('should hide repositories and firstBoot on premise', () => {
      expect(
        isCustomizationSupported('repositories', undefined, onPremiseCtx),
      ).toBe(false);
      expect(
        isCustomizationSupported('firstBoot', undefined, onPremiseCtx),
      ).toBe(false);
    });

    it('should allow other customizations on premise', () => {
      expect(
        isCustomizationSupported('packages', undefined, onPremiseCtx),
      ).toBe(true);
      expect(
        isCustomizationSupported('filesystem', undefined, onPremiseCtx),
      ).toBe(true);
      expect(isCustomizationSupported('users', undefined, onPremiseCtx)).toBe(
        true,
      );
      expect(isCustomizationSupported('kernel', undefined, onPremiseCtx)).toBe(
        true,
      );
    });
  });

  describe('distribution restrictions', () => {
    it('should hide registration for non-RHEL distributions', () => {
      const nonRhelCtx: SupportContext = {
        isImageMode: false,
        isOnPremise: false,
        isRhel: false,
      };

      expect(
        isCustomizationSupported('registration', undefined, nonRhelCtx),
      ).toBe(false);
    });

    it('should allow registration for RHEL distributions', () => {
      const rhelCtx: SupportContext = {
        isImageMode: false,
        isOnPremise: false,
        isRhel: true,
      };

      expect(isCustomizationSupported('registration', undefined, rhelCtx)).toBe(
        true,
      );
    });

    it('should allow other customizations for non-RHEL distributions', () => {
      const nonRhelCtx: SupportContext = {
        isImageMode: false,
        isOnPremise: false,
        isRhel: false,
      };

      expect(isCustomizationSupported('packages', undefined, nonRhelCtx)).toBe(
        true,
      );
      expect(
        isCustomizationSupported('filesystem', undefined, nonRhelCtx),
      ).toBe(true);
      expect(isCustomizationSupported('users', undefined, nonRhelCtx)).toBe(
        true,
      );
    });
  });

  describe('image type supported_blueprint_options', () => {
    const defaultCtx: SupportContext = {
      isImageMode: false,
      isOnPremise: false,
      isRhel: true,
    };

    it('should respect image type supported_blueprint_options list', () => {
      const imageType: ImageTypeInfo = {
        name: 'test-image',
        supported_blueprint_options: ['packages', 'users'],
      };

      expect(isCustomizationSupported('packages', imageType, defaultCtx)).toBe(
        true,
      );
      expect(isCustomizationSupported('users', imageType, defaultCtx)).toBe(
        true,
      );
      expect(
        isCustomizationSupported('filesystem', imageType, defaultCtx),
      ).toBe(false);
      expect(isCustomizationSupported('kernel', imageType, defaultCtx)).toBe(
        false,
      );
    });

    it('should allow all customizations when supported_blueprint_options is undefined', () => {
      const imageType: ImageTypeInfo = {
        name: 'test-image',
      };

      expect(isCustomizationSupported('packages', imageType, defaultCtx)).toBe(
        true,
      );
      expect(
        isCustomizationSupported('filesystem', imageType, defaultCtx),
      ).toBe(true);
      expect(isCustomizationSupported('kernel', imageType, defaultCtx)).toBe(
        true,
      );
      expect(isCustomizationSupported('users', imageType, defaultCtx)).toBe(
        true,
      );
    });

    it('should allow all customizations when imageType is undefined', () => {
      expect(isCustomizationSupported('packages', undefined, defaultCtx)).toBe(
        true,
      );
      expect(
        isCustomizationSupported('filesystem', undefined, defaultCtx),
      ).toBe(true);
      expect(isCustomizationSupported('kernel', undefined, defaultCtx)).toBe(
        true,
      );
    });

    it('should combine on-premise restrictions with image type restrictions', () => {
      const onPremiseCtx: SupportContext = {
        isImageMode: false,
        isOnPremise: true,
        isRhel: true,
      };
      const imageType: ImageTypeInfo = {
        name: 'test-image',
        supported_blueprint_options: ['packages', 'repositories', 'firstBoot'],
      };

      // packages is in supported list and not blocked by on-premise
      expect(
        isCustomizationSupported('packages', imageType, onPremiseCtx),
      ).toBe(true);
      // repositories is in supported list but blocked by on-premise
      expect(
        isCustomizationSupported('repositories', imageType, onPremiseCtx),
      ).toBe(false);
      // firstBoot is in supported list but blocked by on-premise
      expect(
        isCustomizationSupported('firstBoot', imageType, onPremiseCtx),
      ).toBe(false);
    });
  });

  describe('precedence rules', () => {
    it('should apply image mode restrictions before other restrictions', () => {
      const imageModeOnPremiseCtx: SupportContext = {
        isImageMode: true,
        isOnPremise: true,
        isRhel: true,
      };

      // In image mode, only filesystem and users are allowed
      // even though on-premise would block other things
      expect(
        isCustomizationSupported(
          'filesystem',
          undefined,
          imageModeOnPremiseCtx,
        ),
      ).toBe(true);
      expect(
        isCustomizationSupported('users', undefined, imageModeOnPremiseCtx),
      ).toBe(true);
      expect(
        isCustomizationSupported('packages', undefined, imageModeOnPremiseCtx),
      ).toBe(false);
      // repositories would be blocked by both image mode and on-premise
      expect(
        isCustomizationSupported(
          'repositories',
          undefined,
          imageModeOnPremiseCtx,
        ),
      ).toBe(false);
    });
  });
});

describe('computeImageTypeCustomizationSupport', () => {
  const defaultCtx: SupportContext = {
    isImageMode: false,
    isOnPremise: false,
    isRhel: true,
  };

  describe('empty and edge cases', () => {
    it('should return empty array when no image types provided', () => {
      const result = computeImageTypeCustomizationSupport(
        {},
        'packages',
        defaultCtx,
      );

      expect(result).toEqual([]);
    });

    it('should filter out entries with invalid image type keys', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        'invalid-image-type': {
          name: 'invalid',
          supported_blueprint_options: ['packages'],
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        defaultCtx,
      );

      expect(result).toEqual([]);
    });
  });

  describe('single image type', () => {
    it('should return supported=true when image type supports the customization', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: ['packages', 'filesystem', 'users'],
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        defaultCtx,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'AWS',
        supported: true,
      });
    });

    it('should return supported=false when image type does not support the customization', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: ['packages', 'users'],
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'filesystem',
        defaultCtx,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'AWS',
        supported: false,
      });
    });

    it('should return supported=true when supported_blueprint_options is undefined', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        gcp: {
          name: 'gcp',
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'filesystem',
        defaultCtx,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Google Cloud',
        supported: true,
      });
    });
  });

  describe('multiple image types', () => {
    it('should return correct support status for each image type', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: ['packages', 'filesystem'],
        },
        'image-installer': {
          name: 'image-installer',
          supported_blueprint_options: ['packages'],
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'filesystem',
        defaultCtx,
      );

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        name: 'AWS',
        supported: true,
      });
      expect(result).toContainEqual({
        name: 'Installer',
        supported: false,
      });
    });

    it('should handle mixed valid and invalid image type keys', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: ['packages'],
        },
        'not-a-real-type': {
          name: 'fake',
          supported_blueprint_options: ['packages'],
        },
        gcp: {
          name: 'gcp',
          supported_blueprint_options: ['packages'],
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        defaultCtx,
      );

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toContain('AWS');
      expect(result.map((r) => r.name)).toContain('Google Cloud');
      expect(result.map((r) => r.name)).not.toContain('fake');
    });
  });

  describe('name mapping', () => {
    it('should map image type keys to display names correctly', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: { name: 'aws' },
        azure: { name: 'azure' },
        gcp: { name: 'gcp' },
        'guest-image': { name: 'guest-image' },
        vsphere: { name: 'vsphere' },
        wsl: { name: 'wsl' },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        defaultCtx,
      );

      const names = result.map((r) => r.name);
      expect(names).toContain('AWS');
      expect(names).toContain('Microsoft Azure');
      expect(names).toContain('Google Cloud');
      expect(names).toContain('Guest image');
      expect(names).toContain('vSphere');
      expect(names).toContain('WSL');
    });
  });

  describe('context restrictions', () => {
    it('should respect on-premise restrictions', () => {
      const onPremiseCtx: SupportContext = {
        isImageMode: false,
        isOnPremise: true,
        isRhel: true,
      };

      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: [
            'repositories',
            'firstBoot',
            'packages',
          ],
        },
      };

      const reposResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'repositories',
        onPremiseCtx,
      );
      expect(reposResult[0].supported).toBe(false);

      const firstBootResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'firstBoot',
        onPremiseCtx,
      );
      expect(firstBootResult[0].supported).toBe(false);

      const packagesResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        onPremiseCtx,
      );
      expect(packagesResult[0].supported).toBe(true);
    });

    it('should respect non-RHEL distribution restrictions', () => {
      const nonRhelCtx: SupportContext = {
        isImageMode: false,
        isOnPremise: false,
        isRhel: false,
      };

      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: ['registration', 'packages'],
        },
      };

      const registrationResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'registration',
        nonRhelCtx,
      );
      expect(registrationResult[0].supported).toBe(false);

      const packagesResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        nonRhelCtx,
      );
      expect(packagesResult[0].supported).toBe(true);
    });

    it('should respect image mode restrictions', () => {
      const imageModeCtx: SupportContext = {
        isImageMode: true,
        isOnPremise: false,
        isRhel: true,
      };

      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: [
            'filesystem',
            'users',
            'packages',
            'kernel',
          ],
        },
      };

      const filesystemResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'filesystem',
        imageModeCtx,
      );
      expect(filesystemResult[0].supported).toBe(true);

      const usersResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'users',
        imageModeCtx,
      );
      expect(usersResult[0].supported).toBe(true);

      const packagesResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        imageModeCtx,
      );
      expect(packagesResult[0].supported).toBe(false);

      const kernelResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'kernel',
        imageModeCtx,
      );
      expect(kernelResult[0].supported).toBe(false);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle network-installer which only supports locale and fips', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        'network-installer': {
          name: 'network-installer',
          supported_blueprint_options: ['locale', 'fips'],
        },
      };

      const localeResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'locale',
        defaultCtx,
      );
      expect(localeResult[0]).toEqual({
        name: 'Network Installer',
        supported: true,
      });

      const packagesResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        defaultCtx,
      );
      expect(packagesResult[0]).toEqual({
        name: 'Network Installer',
        supported: false,
      });
    });

    it('should handle wsl which does not support filesystem or kernel', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        wsl: {
          name: 'wsl',
          supported_blueprint_options: ['packages', 'users', 'timezone'],
        },
      };

      const filesystemResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'filesystem',
        defaultCtx,
      );
      expect(filesystemResult[0].supported).toBe(false);

      const kernelResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'kernel',
        defaultCtx,
      );
      expect(kernelResult[0].supported).toBe(false);

      const packagesResult = computeImageTypeCustomizationSupport(
        imageTypes,
        'packages',
        defaultCtx,
      );
      expect(packagesResult[0].supported).toBe(true);
    });

    it('should correctly identify support across multiple image types for UI labeling', () => {
      const imageTypes: Record<string, ImageTypeInfo> = {
        aws: {
          name: 'aws',
          supported_blueprint_options: ['filesystem', 'packages'],
        },
        'image-installer': {
          name: 'image-installer',
          supported_blueprint_options: ['packages'],
        },
        wsl: {
          name: 'wsl',
          supported_blueprint_options: ['packages'],
        },
      };

      const result = computeImageTypeCustomizationSupport(
        imageTypes,
        'filesystem',
        defaultCtx,
      );

      const awsEntry = result.find((r) => r.name === 'AWS');
      const installerEntry = result.find((r) => r.name === 'Installer');
      const wslEntry = result.find((r) => r.name === 'WSL');

      expect(awsEntry?.supported).toBe(true);
      expect(installerEntry?.supported).toBe(false);
      expect(wslEntry?.supported).toBe(false);
    });
  });
});
