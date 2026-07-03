import { describe, expect, it } from 'vitest';

import { categorizeEnvironments } from '../derived';

describe('categorizeEnvironments', () => {
  it('categorizes public clouds', () => {
    const result = categorizeEnvironments(['aws', 'gcp', 'azure', 'oci']);

    expect(result.publicClouds).toEqual(['aws', 'gcp', 'azure', 'oci']);
    expect(result.privateClouds).toEqual([]);
    expect(result.miscFormats).toEqual([]);
    expect(result.hasEnvironments).toBe(true);
  });

  it('categorizes private clouds', () => {
    const result = categorizeEnvironments(['vsphere', 'vsphere-ova']);

    expect(result.publicClouds).toEqual([]);
    expect(result.privateClouds).toEqual(['vsphere', 'vsphere-ova']);
    expect(result.miscFormats).toEqual([]);
    expect(result.hasEnvironments).toBe(true);
  });

  it('categorizes misc formats', () => {
    const result = categorizeEnvironments([
      'guest-image',
      'image-installer',
      'network-installer',
    ]);

    expect(result.publicClouds).toEqual([]);
    expect(result.privateClouds).toEqual([]);
    expect(result.miscFormats).toEqual([
      'guest-image',
      'image-installer',
      'network-installer',
    ]);
    expect(result.hasEnvironments).toBe(true);
  });

  it('splits a mixed set into categories', () => {
    const result = categorizeEnvironments([
      'aws',
      'vsphere',
      'guest-image',
      'gcp',
      'vsphere-ova',
      'image-installer',
    ]);

    expect(result.publicClouds).toEqual(['aws', 'gcp']);
    expect(result.privateClouds).toEqual(['vsphere', 'vsphere-ova']);
    expect(result.miscFormats).toEqual(['guest-image', 'image-installer']);
    expect(result.hasEnvironments).toBe(true);
  });

  it('returns empty arrays for empty input', () => {
    const result = categorizeEnvironments([]);

    expect(result.publicClouds).toEqual([]);
    expect(result.privateClouds).toEqual([]);
    expect(result.miscFormats).toEqual([]);
    expect(result.hasEnvironments).toBe(false);
  });
});
