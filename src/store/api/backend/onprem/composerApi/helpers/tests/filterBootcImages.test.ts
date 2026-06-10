import { describe, expect, it } from 'vitest';

import { PodmanImageInfo } from '../../../types';
import { filterBootcImages, normalizeArch } from '../podman';

const defaultLabels = {
  version: '10',
  'containers.bootc': '1' as const,
};

const makeImage = (
  overrides: Partial<Omit<PodmanImageInfo, 'Labels'>> & {
    Labels?: Partial<PodmanImageInfo['Labels']> | null;
  } = {},
): PodmanImageInfo => {
  const { Labels, ...rest } = overrides;
  return {
    Id: 'sha256:abc123',
    Architecture: 'amd64',
    Labels: Labels === null ? undefined : { ...defaultLabels, ...Labels },
    RepoTags: ['registry.redhat.io/rhel10/rhel-bootc:10.0'],
    ...rest,
  };
};

describe('normalizeArch', () => {
  it('maps kernel arch to RPM arch', () => {
    expect(normalizeArch('amd64')).toBe('x86_64');
    expect(normalizeArch('arm64')).toBe('aarch64');
  });

  it('passes through RPM arch unchanged', () => {
    expect(normalizeArch('x86_64')).toBe('x86_64');
    expect(normalizeArch('aarch64')).toBe('aarch64');
  });

  it('returns undefined for unknown arch', () => {
    expect(normalizeArch('sparc')).toBeUndefined();
  });

  it('returns undefined when arch is undefined', () => {
    expect(normalizeArch(undefined)).toBeUndefined();
  });
});

describe('filterBootcImages', () => {
  it('returns true for a valid bootc image with architecture', () => {
    expect(filterBootcImages(makeImage())).toBe(true);
  });

  it('returns true when ostree.bootable is true (no containers.bootc)', () => {
    const image = makeImage({
      Labels: {
        'ostree.bootable': 'true',
      },
    });

    expect(filterBootcImages(image)).toBe(true);
  });

  it('returns true when both containers.bootc and ostree.bootable are present', () => {
    const image = makeImage({
      Labels: {
        'containers.bootc': '1',
        'ostree.bootable': 'true',
      },
    });

    expect(filterBootcImages(image)).toBe(true);
  });

  it('returns false when neither bootc label is present', () => {
    const image: PodmanImageInfo = {
      Id: 'sha256:abc123',
      Architecture: 'amd64',
      Labels: { version: '10' },
      RepoTags: ['registry.example.com/test:latest'],
    };

    expect(filterBootcImages(image)).toBe(false);
  });

  it('returns false when containers.bootc is 0 and ostree.bootable is absent', () => {
    expect(
      filterBootcImages(makeImage({ Labels: { 'containers.bootc': '0' } })),
    ).toBe(false);
  });

  it('returns false when Architecture is missing', () => {
    expect(filterBootcImages(makeImage({ Architecture: undefined }))).toBe(
      false,
    );
  });

  it('returns false when Names array is empty', () => {
    const image = makeImage({ RepoTags: [] });

    expect(filterBootcImages(image)).toBe(false);
  });

  it('returns false when Labels is missing', () => {
    const image = makeImage({ Labels: null });

    expect(filterBootcImages(image)).toBe(false);
  });
});
