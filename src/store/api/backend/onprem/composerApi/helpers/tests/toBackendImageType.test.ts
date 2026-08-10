import { describe, expect, it } from 'vitest';

import { toBackendImageType } from '../podman';
import {
  backendToFrontendType,
  frontendToBackendType,
} from '../podman/filters';

describe('toBackendImageType', () => {
  it('maps frontend aliases back to backend type names', () => {
    expect(toBackendImageType('guest-image')).toBe('qcow2');
    expect(toBackendImageType('aws')).toBe('ami');
    expect(toBackendImageType('bootable-container-iso')).toBe(
      'bootc-generic-iso',
    );
  });

  it('passes through types without an alias', () => {
    expect(toBackendImageType('qcow2')).toBe('qcow2');
    expect(toBackendImageType('image-installer')).toBe('image-installer');
  });

  it('keeps the two maps exact inverses of each other', () => {
    const inverted = Object.fromEntries(
      Object.entries(backendToFrontendType).map(([backend, frontend]) => [
        frontend,
        backend,
      ]),
    );

    expect(frontendToBackendType).toEqual(inverted);
  });
});
