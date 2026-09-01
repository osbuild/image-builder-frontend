import { describe, expect, it } from 'vitest';

import {
  validateDisabledServices,
  validateEnabledServices,
  validateMaskedServices,
} from '../../validators';

// All three service categories (enabled, disabled, masked) share the same
// `serviceSchema`, so the format rules are exercised once through
// `validateEnabledServices`. The per-category behaviour (including duplicate
// detection, which uses a category-specific label) is covered separately.
const isValid = (service: string) =>
  validateEnabledServices([service]).length === 0;

describe('systemd services validation', () => {
  describe('valid services', () => {
    it('accepts a systemd unit name', () => {
      expect(isValid('sshd.service')).toBe(true);
    });

    it('accepts a timer unit', () => {
      expect(isValid('dnf-makecache.timer')).toBe(true);
    });

    it('accepts a socket unit', () => {
      expect(isValid('cockpit.socket')).toBe(true);
    });

    it('accepts a template unit', () => {
      expect(isValid('getty@tty1')).toBe(true);
    });

    it('accepts a mount unit', () => {
      expect(isValid('home.mount')).toBe(true);
    });

    it('accepts a service with underscores', () => {
      expect(isValid('network_manager')).toBe(true);
    });

    it('accepts a service with mixed case', () => {
      expect(isValid('NetworkManager')).toBe(true);
    });

    it('accepts a single-character name', () => {
      expect(isValid('a')).toBe(true);
    });

    it('accepts a name at the 256-character limit', () => {
      expect(isValid('a'.repeat(256))).toBe(true);
    });

    it('accepts a colon in the middle of a name', () => {
      expect(isValid('foo:bar')).toBe(true);
    });

    it('returns no issues for an empty list', () => {
      expect(validateEnabledServices([])).toEqual([]);
    });
  });

  describe('invalid services', () => {
    it('rejects an empty string', () => {
      expect(isValid('')).toBe(false);
    });

    it('rejects a service with consecutive hyphens', () => {
      expect(isValid('my--service')).toBe(false);
    });

    it('rejects a service starting with a dot', () => {
      expect(isValid('.hidden')).toBe(false);
    });

    it('rejects a service ending with a dot', () => {
      expect(isValid('service.')).toBe(false);
    });

    it('rejects a service starting with a hyphen', () => {
      expect(isValid('-foo')).toBe(false);
    });

    it('rejects a service ending with a hyphen', () => {
      expect(isValid('foo-')).toBe(false);
    });

    it('rejects a service with spaces', () => {
      expect(isValid('my service')).toBe(false);
    });

    it('rejects a purely numeric service', () => {
      expect(isValid('12345')).toBe(false);
    });

    it('rejects a service over 256 characters', () => {
      expect(isValid('a'.repeat(257))).toBe(false);
    });
  });

  describe.each([
    ['enabled', validateEnabledServices, 'enabled services'],
    ['disabled', validateDisabledServices, 'disabled services'],
    ['masked', validateMaskedServices, 'masked services'],
  ])('%s services validator', (_category, validate, label) => {
    it('accepts a valid service', () => {
      expect(validate(['sshd.service'])).toEqual([]);
    });

    it('rejects an invalid service', () => {
      expect(validate(['my--service']).length).toBeGreaterThan(0);
    });

    it('flags a duplicate service', () => {
      const result = validate(['sshd', 'sshd']);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        kind: 'duplicate',
        value: 'sshd',
      });
      expect(result[0].message).toContain(label);
    });
  });
});
