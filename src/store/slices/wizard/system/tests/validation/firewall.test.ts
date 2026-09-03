import { describe, expect, it } from 'vitest';

import {
  isPortValid,
  isServiceValid,
} from '@/Components/CreateImageWizard/validators';

describe('firewall validation', () => {
  describe('ports', () => {
    describe('valid ports', () => {
      it('accepts a numeric port with protocol', () => {
        expect(isPortValid('8080:tcp')).toBe(true);
      });

      it('accepts a port range with protocol', () => {
        expect(isPortValid('8080-8090:tcp')).toBe(true);
      });

      it('accepts a named port with protocol', () => {
        expect(isPortValid('https:tcp')).toBe(true);
      });

      it('accepts udp protocol', () => {
        expect(isPortValid('53:udp')).toBe(true);
      });

      it('accepts a single digit port', () => {
        expect(isPortValid('1:tcp')).toBe(true);
      });

      it('accepts a five digit port', () => {
        expect(isPortValid('65535:tcp')).toBe(true);
      });
    });

    describe('invalid ports', () => {
      it('rejects a port without protocol', () => {
        expect(isPortValid('8080')).toBe(false);
      });

      it('rejects a port with invalid protocol', () => {
        expect(isPortValid('8080:TCP')).toBe(false);
      });

      it('rejects an empty string', () => {
        expect(isPortValid('')).toBe(false);
      });

      it('rejects just a protocol', () => {
        expect(isPortValid(':tcp')).toBe(false);
      });

      it('rejects a port with spaces', () => {
        expect(isPortValid('80 :tcp')).toBe(false);
      });

      it('rejects a port exceeding five digits', () => {
        expect(isPortValid('123456:tcp')).toBe(false);
      });
    });
  });

  describe('firewall services', () => {
    describe('valid services', () => {
      it('accepts a simple service name', () => {
        expect(isServiceValid('ssh')).toBe(true);
      });

      it('accepts a service with hyphens', () => {
        expect(isServiceValid('cockpit-ws')).toBe(true);
      });

      it('accepts a service with dots', () => {
        expect(isServiceValid('sshd.service')).toBe(true);
      });

      it('accepts a service with underscores', () => {
        expect(isServiceValid('my_service')).toBe(true);
      });

      it('accepts a service with at sign', () => {
        expect(isServiceValid('getty@tty1')).toBe(true);
      });

      it('accepts a service with colons', () => {
        expect(isServiceValid('dbus:org.freedesktop')).toBe(true);
      });

      it('accepts a single character service', () => {
        expect(isServiceValid('a')).toBe(true);
      });

      it('accepts a service at max length (256 characters)', () => {
        const service = 'a'.repeat(256);
        expect(isServiceValid(service)).toBe(true);
      });
    });

    describe('invalid services', () => {
      it('rejects an empty string', () => {
        expect(isServiceValid('')).toBe(false);
      });

      it('rejects a service exceeding 256 characters', () => {
        const service = 'a'.repeat(257);
        expect(isServiceValid(service)).toBe(false);
      });

      it('rejects a service starting with a hyphen', () => {
        expect(isServiceValid('-service')).toBe(false);
      });

      it('rejects a service ending with a hyphen', () => {
        expect(isServiceValid('service-')).toBe(false);
      });

      it('rejects a service with consecutive hyphens', () => {
        expect(isServiceValid('my--service')).toBe(false);
      });

      it('rejects a service with spaces', () => {
        expect(isServiceValid('my service')).toBe(false);
      });

      it('rejects a purely numeric service', () => {
        expect(isServiceValid('12345')).toBe(false);
      });

      it('rejects a service with special characters', () => {
        expect(isServiceValid('service!')).toBe(false);
      });
    });
  });
});
