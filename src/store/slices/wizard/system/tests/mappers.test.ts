import { describe, expect, it } from 'vitest';

import { createMockState } from '../../tests/mockWizardState';
import { mapFirstbootFiles, mapSystemCustomizations } from '../mappers';
import { initialState } from '../state';
import type { SystemSlice } from '../types';

const createState = (overrides: Partial<SystemSlice> = {}) =>
  createMockState({
    system: { ...initialState, ...overrides },
  });

describe('mapSystemCustomizations', () => {
  it('includes locale for default state (default language is C.UTF-8)', () => {
    const state = createState();
    expect(mapSystemCustomizations(state)).toEqual({
      locale: { languages: ['C.UTF-8'] },
    });
  });

  describe('services', () => {
    it('includes services when enabled list is populated', () => {
      const state = createState({
        services: {
          enabled: ['httpd', 'sshd'],
          masked: [],
          disabled: [],
        },
      });
      const result = mapSystemCustomizations(state);
      expect(result.services).toEqual({
        enabled: ['httpd', 'sshd'],
        masked: undefined,
        disabled: undefined,
      });
    });

    it('includes services when disabled list is populated', () => {
      const state = createState({
        services: {
          enabled: [],
          masked: [],
          disabled: ['firewalld'],
        },
      });
      const result = mapSystemCustomizations(state);
      expect(result.services).toEqual({
        enabled: undefined,
        masked: undefined,
        disabled: ['firewalld'],
      });
    });

    it('omits services key when all lists are empty', () => {
      const state = createState();
      expect(mapSystemCustomizations(state)).not.toHaveProperty('services');
    });
  });

  describe('hostname', () => {
    it('includes hostname when set', () => {
      const state = createState({ hostname: 'my-host' });
      expect(mapSystemCustomizations(state)).toEqual(
        expect.objectContaining({ hostname: 'my-host' }),
      );
    });

    it('omits hostname when empty', () => {
      const state = createState({ hostname: '' });
      expect(mapSystemCustomizations(state)).not.toHaveProperty('hostname');
    });
  });

  describe('kernel', () => {
    it('includes kernel with name', () => {
      const state = createState({
        kernel: { name: 'kernel-rt', append: [] },
      });
      const result = mapSystemCustomizations(state);
      expect(result.kernel).toEqual({ name: 'kernel-rt' });
    });

    it('includes kernel with append string', () => {
      const state = createState({
        kernel: { name: '', append: ['nosmt', 'quiet'] },
      });
      const result = mapSystemCustomizations(state);
      expect(result.kernel).toEqual({ append: 'nosmt quiet' });
    });

    it('includes both name and append when set', () => {
      const state = createState({
        kernel: { name: 'kernel-rt', append: ['nosmt'] },
      });
      const result = mapSystemCustomizations(state);
      expect(result.kernel).toEqual({ name: 'kernel-rt', append: 'nosmt' });
    });

    it('omits kernel when no name or append', () => {
      const state = createState({
        kernel: { name: '', append: [] },
      });
      expect(mapSystemCustomizations(state)).not.toHaveProperty('kernel');
    });
  });

  describe('timezone', () => {
    it('includes timezone when set', () => {
      const state = createState({
        timezone: { timezone: 'UTC', ntpservers: [] },
      });
      const result = mapSystemCustomizations(state);
      expect(result.timezone).toEqual({ timezone: 'UTC' });
    });

    it('includes ntpservers when set', () => {
      const state = createState({
        timezone: { timezone: '', ntpservers: ['pool.ntp.org'] },
      });
      const result = mapSystemCustomizations(state);
      expect(result.timezone).toEqual({ ntpservers: ['pool.ntp.org'] });
    });

    it('omits timezone when both empty', () => {
      const state = createState();
      expect(mapSystemCustomizations(state)).not.toHaveProperty('timezone');
    });

    it('omits timezone in image mode', () => {
      const state = createMockState({
        system: {
          ...initialState,
          timezone: { timezone: 'UTC', ntpservers: ['pool.ntp.org'] },
        },
        details: {
          blueprint: {
            name: 'test',
            description: '',
            isCustomName: false,
            mode: 'image',
          },
          mode: 'create',
        },
      });
      expect(mapSystemCustomizations(state)).not.toHaveProperty('timezone');
    });
  });

  describe('locale', () => {
    it('includes languages when set', () => {
      const state = createState({
        locale: { languages: ['en_US.UTF-8'], keyboard: '' },
      });
      const result = mapSystemCustomizations(state);
      expect(result.locale).toEqual({ languages: ['en_US.UTF-8'] });
    });

    it('includes keyboard when set', () => {
      const state = createState({
        locale: { languages: [], keyboard: 'us' },
      });
      const result = mapSystemCustomizations(state);
      expect(result.locale).toEqual({ keyboard: 'us' });
    });

    it('omits locale when both empty', () => {
      const state = createState({
        locale: { languages: [], keyboard: '' },
      });
      expect(mapSystemCustomizations(state)).not.toHaveProperty('locale');
    });

    it('omits locale in image mode', () => {
      const state = createMockState({
        system: {
          ...initialState,
          locale: { languages: ['en_US.UTF-8'], keyboard: 'us' },
        },
        details: {
          blueprint: {
            name: 'test',
            description: '',
            isCustomName: false,
            mode: 'image',
          },
          mode: 'create',
        },
      });
      expect(mapSystemCustomizations(state)).not.toHaveProperty('locale');
    });
  });

  describe('firewall', () => {
    it('includes firewall with ports', () => {
      const state = createState({
        firewall: {
          ports: ['8080:tcp', '443:tcp'],
          services: { enabled: [], disabled: [] },
        },
      });
      const result = mapSystemCustomizations(state);
      expect(result.firewall).toEqual({
        ports: ['8080:tcp', '443:tcp'],
      });
    });

    it('includes firewall with services', () => {
      const state = createState({
        firewall: {
          ports: [],
          services: { enabled: ['ssh'], disabled: ['telnet'] },
        },
      });
      const result = mapSystemCustomizations(state);
      expect(result.firewall).toEqual({
        services: { enabled: ['ssh'], disabled: ['telnet'] },
      });
    });

    it('includes firewall services when only enabled is set', () => {
      const state = createState({
        firewall: {
          ports: [],
          services: { enabled: ['ssh'], disabled: [] },
        },
      });
      const result = mapSystemCustomizations(state);
      expect(result.firewall).toEqual({
        services: { enabled: ['ssh'] },
      });
    });

    it('includes firewall services when only disabled is set', () => {
      const state = createState({
        firewall: {
          ports: [],
          services: { enabled: [], disabled: ['telnet'] },
        },
      });
      const result = mapSystemCustomizations(state);
      expect(result.firewall).toEqual({
        services: { disabled: ['telnet'] },
      });
    });

    it('omits firewall when empty', () => {
      const state = createState();
      expect(mapSystemCustomizations(state)).not.toHaveProperty('firewall');
    });
  });
});

describe('mapFirstbootFiles', () => {
  it('returns files when firstboot script is set', () => {
    const state = createState({
      firstboot: { script: 'echo hello' },
    });
    const result = mapFirstbootFiles(state);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ data_encoding: 'base64' }),
      ]),
    );
  });

  it('returns empty array when no firstboot script', () => {
    const state = createState();
    expect(mapFirstbootFiles(state)).toEqual([]);
  });
});
