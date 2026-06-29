import { describe, expect, it } from 'vitest';

import {
  isEdgeType,
  isPrivateCloud,
  isPublicCloud,
  isRhel,
  isSupportedImageType,
} from '../typeguards';

describe('isRhel', () => {
  it.each(['rhel-8', 'rhel-9', 'rhel-9-beta', 'rhel-10', 'rhel-10-beta'])(
    'returns true for %s',
    (distro) => {
      expect(isRhel(distro)).toBe(true);
    },
  );

  it.each(['centos-9', 'fedora-41', 'rhel', 'rhel-11'])(
    'returns false for %s',
    (distro) => {
      expect(isRhel(distro)).toBe(false);
    },
  );

  it('returns false for undefined', () => {
    expect(isRhel(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isRhel('')).toBe(false);
  });
});

describe('isPublicCloud', () => {
  it.each(['aws', 'ami', 'azure', 'gcp', 'oci', 'vhd'])(
    'returns true for %s',
    (env) => {
      expect(isPublicCloud(env)).toBe(true);
    },
  );

  it.each(['vsphere', 'guest-image', 'wsl', 'edge-commit'])(
    'returns false for %s',
    (env) => {
      expect(isPublicCloud(env)).toBe(false);
    },
  );
});

describe('isPrivateCloud', () => {
  it.each(['vsphere', 'vsphere-ova'])('returns true for %s', (env) => {
    expect(isPrivateCloud(env)).toBe(true);
  });

  it.each(['aws', 'guest-image', 'wsl', 'edge-commit'])(
    'returns false for %s',
    (env) => {
      expect(isPrivateCloud(env)).toBe(false);
    },
  );
});

describe('isEdgeType', () => {
  it.each([
    'edge-commit',
    'edge-installer',
    'rhel-edge-commit',
    'rhel-edge-installer',
  ])('returns true for %s', (env) => {
    expect(isEdgeType(env)).toBe(true);
  });

  it.each(['aws', 'guest-image', 'vsphere', 'iso'])(
    'returns false for %s',
    (env) => {
      expect(isEdgeType(env)).toBe(false);
    },
  );
});

describe('isSupportedImageType', () => {
  it.each(['aws', 'ami', 'azure', 'gcp', 'vsphere', 'guest-image'])(
    'returns true for supported type %s',
    (env) => {
      expect(isSupportedImageType(env)).toBe(true);
    },
  );

  it.each([
    'edge-commit',
    'edge-installer',
    'rhel-edge-commit',
    'rhel-edge-installer',
  ])('returns false for edge type %s', (env) => {
    expect(isSupportedImageType(env)).toBe(false);
  });

  it('returns false for arbitrary strings', () => {
    expect(isSupportedImageType('not-a-real-type')).toBe(false);
  });
});
