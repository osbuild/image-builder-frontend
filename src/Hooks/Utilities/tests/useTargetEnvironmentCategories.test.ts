import { renderHook } from '@testing-library/react';

import { useTargetEnvironmentCategories } from '../useTargetEnvironmentCategories';

describe('useTargetEnvironmentCategories', () => {
  test('returns empty arrays when no environments are provided', () => {
    const { result } = renderHook(() => useTargetEnvironmentCategories([]));

    expect(result.current.publicClouds).toEqual([]);
    expect(result.current.privateClouds).toEqual([]);
    expect(result.current.miscFormats).toEqual([]);
  });

  test('categorizes public cloud environments correctly', () => {
    const environments = ['aws', 'azure', 'gcp', 'oci'];
    const { result } = renderHook(() =>
      useTargetEnvironmentCategories(environments),
    );

    expect(result.current.publicClouds).toEqual(['aws', 'azure', 'gcp', 'oci']);
    expect(result.current.privateClouds).toEqual([]);
    expect(result.current.miscFormats).toEqual([]);
  });

  test('categorizes private cloud environments correctly', () => {
    const environments = ['vsphere', 'vsphere-ova'];
    const { result } = renderHook(() =>
      useTargetEnvironmentCategories(environments),
    );

    expect(result.current.publicClouds).toEqual([]);
    expect(result.current.privateClouds).toEqual(['vsphere', 'vsphere-ova']);
    expect(result.current.miscFormats).toEqual([]);
  });

  test('categorizes misc formats correctly', () => {
    const environments = ['guest-image', 'image-installer', 'wsl'];
    const { result } = renderHook(() =>
      useTargetEnvironmentCategories(environments),
    );

    expect(result.current.publicClouds).toEqual([]);
    expect(result.current.privateClouds).toEqual([]);
    expect(result.current.miscFormats).toEqual([
      'guest-image',
      'image-installer',
      'wsl',
    ]);
  });

  test('categorizes mixed environments correctly', () => {
    const environments = [
      'aws',
      'vsphere',
      'guest-image',
      'gcp',
      'vsphere-ova',
      'image-installer',
    ];
    const { result } = renderHook(() =>
      useTargetEnvironmentCategories(environments),
    );

    expect(result.current.publicClouds).toEqual(['aws', 'gcp']);
    expect(result.current.privateClouds).toEqual(['vsphere', 'vsphere-ova']);
    expect(result.current.miscFormats).toEqual([
      'guest-image',
      'image-installer',
    ]);
  });

  test('preserves order of environments within each category', () => {
    const environments = ['gcp', 'aws', 'azure'];
    const { result } = renderHook(() =>
      useTargetEnvironmentCategories(environments),
    );

    expect(result.current.publicClouds).toEqual(['gcp', 'aws', 'azure']);
  });
});
