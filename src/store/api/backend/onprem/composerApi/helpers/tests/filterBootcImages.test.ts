import { describe, expect, it } from 'vitest';

import { PodmanImageInfo } from '../../../types';
import { filterBootcImages } from '../podmanImages';

const makeImage = (
  overrides: Partial<PodmanImageInfo['Labels']> = {},
): PodmanImageInfo => ({
  Labels: {
    architecture: 'x86_64',
    version: '10',
    'containers.bootc': '1',
    ...overrides,
  },
  Names: ['registry.redhat.io/rhel10/rhel-bootc:10.0'],
});

describe('filterBootcImages', () => {
  it('returns true for a valid bootc image with matching arch', () => {
    const predicate = filterBootcImages('x86_64');
    expect(predicate(makeImage())).toBe(true);
  });

  it('returns false when architecture does not match', () => {
    const predicate = filterBootcImages('aarch64');
    expect(predicate(makeImage({ architecture: 'x86_64' }))).toBe(false);
  });

  it('returns true when ostree.bootable is true (no containers.bootc)', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({
      'ostree.bootable': 'true',
    });
    delete image.Labels!['containers.bootc'];

    expect(predicate(image)).toBe(true);
  });

  it('returns false when ostree.bootable is true but architecture differs', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({
      architecture: 'aarch64',
      'ostree.bootable': 'true',
    });
    delete image.Labels!['containers.bootc'];

    expect(predicate(image)).toBe(false);
  });

  it('returns true when both containers.bootc and ostree.bootable are present', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage({
      'containers.bootc': '1',
      'ostree.bootable': 'true',
    });

    expect(predicate(image)).toBe(true);
  });

  it('returns false when neither bootc label is present', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage();
    delete image.Labels!['containers.bootc'];

    expect(predicate(image)).toBe(false);
  });

  it('returns false when containers.bootc is 0 and ostree.bootable is absent', () => {
    const predicate = filterBootcImages('x86_64');
    expect(predicate(makeImage({ 'containers.bootc': '0' }))).toBe(false);
  });

  it('returns false when arch argument is undefined', () => {
    const predicate = filterBootcImages(undefined);
    expect(predicate(makeImage())).toBe(false);
  });

  it('returns false when Names array is empty', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage();
    image.Names = [];

    expect(predicate(image)).toBe(false);
  });

  it('returns false when Labels is missing', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage();
    image.Labels = undefined;

    expect(predicate(image)).toBe(false);
  });
});
