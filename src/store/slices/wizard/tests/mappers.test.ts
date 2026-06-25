import { describe, expect, it } from 'vitest';

import { initialState } from '@/store/slices/wizard';

import { createMockState } from './mockWizardState';

import { mapFileCustomizations } from '../mappers';

describe('mapFileCustomizations', () => {
  it('returns undefined when no files are contributed', () => {
    const state = createMockState({});
    expect(mapFileCustomizations(state)).toBeUndefined();
  });

  it('returns files with firstboot entries when script is set', () => {
    const state = createMockState({
      system: {
        ...initialState.system,
        firstBoot: { script: 'echo hello' },
      },
    });
    const result = mapFileCustomizations(state);
    expect(result).toBeDefined();
    expect(result!.files).toHaveLength(2);
    expect(result!.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ data_encoding: 'base64' }),
      ]),
    );
  });

  it('returns files with satellite entries when satellite registration is configured', () => {
    const state = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
        satelliteRegistration: {
          command: 'satellite-register --org=123',
          caCert: undefined,
        },
      },
    });
    const result = mapFileCustomizations(state);
    expect(result).toBeDefined();
    expect(result!.files).toHaveLength(2);
  });

  it('returns combined files when both firstboot and satellite are set', () => {
    const state = createMockState({
      system: {
        ...initialState.system,
        firstBoot: { script: 'echo hello' },
      },
      registration: {
        ...initialState.registration,
        type: 'register-satellite',
        satelliteRegistration: {
          command: 'satellite-register --org=123',
          caCert: undefined,
        },
      },
    });
    const result = mapFileCustomizations(state);
    expect(result).toBeDefined();
    expect(result!.files).toHaveLength(4);
  });

  it('does not include satellite files when registration type is not satellite', () => {
    const state = createMockState({
      registration: {
        ...initialState.registration,
        type: 'register-now-rhc',
        satelliteRegistration: {
          command: 'satellite-register --org=123',
          caCert: undefined,
        },
      },
    });
    expect(mapFileCustomizations(state)).toBeUndefined();
  });
});
