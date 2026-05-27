import { describe, expect, it } from 'vitest';

import { PodmanImageInfo } from '../../../types';
import { filterBootcImages } from '../podmanImages';

const makeImage = (
  overrides: Partial<PodmanImageInfo['Labels']> = {},
): PodmanImageInfo => ({
  Labels: {
    architecture: 'x86_64',
    version: '10',
    'redhat.id': 'rhel',
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

  it('returns false when redhat.id label is missing', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage();
    delete image.Labels!['redhat.id'];

    expect(predicate(image)).toBe(false);
  });

  it('returns false when containers.bootc label is missing', () => {
    const predicate = filterBootcImages('x86_64');
    const image = makeImage();
    delete image.Labels!['containers.bootc'];

    expect(predicate(image)).toBe(false);
  });

  it('returns false when containers.bootc is 0', () => {
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
