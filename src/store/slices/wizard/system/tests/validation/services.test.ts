import { describe, expect, it } from 'vitest';

import { isServiceValid } from '@/Components/CreateImageWizard/validators';

// Services (systemd units) use the same validation rules as firewall services.
// These tests cover the systemd-specific context (disabled, masked, enabled)
// to ensure the validation function handles all three categories correctly.

describe('systemd services validation', () => {
  describe('valid services', () => {
    it('accepts a systemd unit name', () => {
      expect(isServiceValid('sshd.service')).toBe(true);
    });

    it('accepts a timer unit', () => {
      expect(isServiceValid('dnf-makecache.timer')).toBe(true);
    });

    it('accepts a socket unit', () => {
      expect(isServiceValid('cockpit.socket')).toBe(true);
    });

    it('accepts a template unit', () => {
      expect(isServiceValid('getty@tty1')).toBe(true);
    });

    it('accepts a mount unit', () => {
      expect(isServiceValid('home.mount')).toBe(true);
    });

    it('accepts a service with underscores', () => {
      expect(isServiceValid('network_manager')).toBe(true);
    });

    it('accepts a service with mixed case', () => {
      expect(isServiceValid('NetworkManager')).toBe(true);
    });
  });

  describe('invalid services', () => {
    it('rejects an empty string', () => {
      expect(isServiceValid('')).toBe(false);
    });

    it('rejects a service with consecutive hyphens', () => {
      expect(isServiceValid('my--service')).toBe(false);
    });

    it('rejects a service starting with a dot', () => {
      expect(isServiceValid('.hidden')).toBe(false);
    });

    it('rejects a service ending with a dot', () => {
      expect(isServiceValid('service.')).toBe(false);
    });

    it('rejects a service with spaces', () => {
      expect(isServiceValid('my service')).toBe(false);
    });

    it('rejects a purely numeric service', () => {
      expect(isServiceValid('12345')).toBe(false);
    });

    it('rejects a service over 256 characters', () => {
      const service = 'a'.repeat(257);
      expect(isServiceValid(service)).toBe(false);
    });
  });
});
