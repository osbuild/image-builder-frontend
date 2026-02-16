import { describe, expect, it } from 'vitest';

import {
  ALL_CUSTOMIZATIONS,
  DISTRO_DETAILS,
} from '../../../store/distributions/constants';
import { CustomizationType } from '../../../store/distributions/types';

describe('DISTRO_DETAILS configuration', () => {
  describe('unrestricted image types', () => {
    it('should have aws supporting all customizations', () => {
      const awsSupported = DISTRO_DETAILS['aws'].supported_blueprint_options;
      expect(awsSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have azure supporting all customizations', () => {
      const azureSupported =
        DISTRO_DETAILS['azure'].supported_blueprint_options;
      expect(azureSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have gcp supporting all customizations', () => {
      const gcpSupported = DISTRO_DETAILS['gcp'].supported_blueprint_options;
      expect(gcpSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have guest-image supporting all customizations', () => {
      const guestImageSupported =
        DISTRO_DETAILS['guest-image'].supported_blueprint_options;
      expect(guestImageSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have vsphere supporting all customizations', () => {
      const vsphereSupported =
        DISTRO_DETAILS['vsphere'].supported_blueprint_options;
      expect(vsphereSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have vsphere-ova supporting all customizations', () => {
      const vsphereOvaSupported =
        DISTRO_DETAILS['vsphere-ova'].supported_blueprint_options;
      expect(vsphereOvaSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have ami supporting all customizations', () => {
      const amiSupported = DISTRO_DETAILS['ami'].supported_blueprint_options;
      expect(amiSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });

    it('should have oci supporting all customizations', () => {
      const ociSupported = DISTRO_DETAILS['oci'].supported_blueprint_options;
      expect(ociSupported).toEqual([...ALL_CUSTOMIZATIONS]);
    });
  });

  describe('network-installer restrictions', () => {
    it('should only allow locale and fips for network-installer', () => {
      const networkInstallerSupported =
        DISTRO_DETAILS['network-installer'].supported_blueprint_options;

      expect(networkInstallerSupported).toEqual(['locale', 'fips']);
    });
  });

  describe('image-installer restrictions', () => {
    it('should allow all customizations except filesystem for image-installer', () => {
      const imageInstallerSupported =
        DISTRO_DETAILS['image-installer'].supported_blueprint_options;

      // Should not contain filesystem
      expect(imageInstallerSupported).not.toContain('filesystem');

      // Should contain all other types
      expect(imageInstallerSupported).toContain('packages');
      expect(imageInstallerSupported).toContain('kernel');
      expect(imageInstallerSupported).toContain('users');
      expect(imageInstallerSupported).toContain('locale');
      expect(imageInstallerSupported).toContain('fips');

      // Should have length of ALL_CUSTOMIZATIONS - 1 (minus filesystem)
      expect(imageInstallerSupported).toHaveLength(
        ALL_CUSTOMIZATIONS.length - 1,
      );
    });
  });

  describe('wsl restrictions', () => {
    it('should allow all customizations except filesystem, kernel, and openscap for wsl', () => {
      const wslSupported = DISTRO_DETAILS['wsl'].supported_blueprint_options;

      // Verify it's an array (not an object due to accidental object spread)
      expect(Array.isArray(wslSupported)).toBe(true);

      // Should not contain filesystem, kernel, and openscap
      expect(wslSupported).not.toContain('filesystem');
      expect(wslSupported).not.toContain('kernel');
      expect(wslSupported).not.toContain('openscap');

      // Should have length of ALL_CUSTOMIZATIONS - 3 (minus filesystem, kernel, and openscap)
      expect(wslSupported).toHaveLength(ALL_CUSTOMIZATIONS.length - 3);
    });
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

describe('DISTRO_DETAILS structure', () => {
  it('should have correct structure for each entry', () => {
    for (const [_, value] of Object.entries(DISTRO_DETAILS)) {
      expect(value).toHaveProperty('name');
      expect(value).toHaveProperty('supported_blueprint_options');
      expect(typeof value.name).toBe('string');
    }
  });

  it('should have entries for all expected image types', () => {
    const expectedImageTypes = [
      'aws',
      'azure',
      'gcp',
      'guest-image',
      'image-installer',
      'vsphere',
      'vsphere-ova',
      'wsl',
      'ami',
      'oci',
      'network-installer',
    ];

    for (const imageType of expectedImageTypes) {
      expect(DISTRO_DETAILS[imageType]).toBeDefined();
    }
  });
});
