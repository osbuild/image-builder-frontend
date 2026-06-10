import { describe, expect, it } from 'vitest';

import { PodmanImageInfo } from '../../../types';
import { filterBootcImages, normalizeArch } from '../podmanImages';

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
    Architecture: 'amd64',
    Labels: Labels === null ? undefined : { ...defaultLabels, ...Labels },
    Names: ['registry.redhat.io/rhel10/rhel-bootc:10.0'],
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
  it('returns true for a valid bootc image with matching arch', () => {
    const predicate = filterBootcImages('x86_64');
    expect(predicate(makeImage())).toBe(true);
  });

  it('matches when filter arch is in kernel format', () => {
    const predicate = filterBootcImages('amd64');
    expect(predicate(makeImage())).toBe(true);
  });

  it('returns false when architecture does not match', () => {
    const predicate = filterBootcImages('aarch64');
    expect(predicate(makeImage())).toBe(false);
  });

  it('returns true when ostree.bootable is true (no containers.bootc)', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({
      Labels: {
        'ostree.bootable': 'true',
      },
    });

    expect(predicate(image)).toBe(true);
  });

  it('returns false when ostree.bootable is true but architecture differs', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({
      Architecture: 'arm64',
      Labels: {
        'ostree.bootable': 'true',
      },
    });

    expect(predicate(image)).toBe(false);
  });

  it('returns true when both containers.bootc and ostree.bootable are present', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({
      Labels: {
        'containers.bootc': '1',
        'ostree.bootable': 'true',
      },
    });

    expect(predicate(image)).toBe(true);
  });

  it('returns false when neither bootc label is present', () => {
    const predicate = filterBootcImages('x86_64');
    const image: PodmanImageInfo = {
      Architecture: 'amd64',
      Labels: { version: '10' },
      Names: ['registry.example.com/test:latest'],
    };

    expect(predicate(image)).toBe(false);
  });

  it('returns false when containers.bootc is 0 and ostree.bootable is absent', () => {
    const predicate = filterBootcImages('x86_64');
    expect(predicate(makeImage({ Labels: { 'containers.bootc': '0' } }))).toBe(
      false,
    );
  });

  it('returns false when filter arch is undefined', () => {
    const predicate = filterBootcImages(undefined);
    expect(predicate(makeImage())).toBe(false);
  });

  it('returns false when image arch is unknown', () => {
    const predicate = filterBootcImages('x86_64');
    expect(predicate(makeImage({ Architecture: 'sparc' }))).toBe(false);
  });

  it('returns false when Names array is empty', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({ Names: [] });

    expect(predicate(image)).toBe(false);
  });

  it('returns false when Labels is missing', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({ Labels: null });

    expect(predicate(image)).toBe(false);
  });
});
