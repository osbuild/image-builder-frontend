import { describe, expect, it } from 'vitest';

import { hostnameSchema } from '../schemas';

describe('hostname validation', () => {
  describe('valid hostnames', () => {
    it('accepts a simple hostname', () => {
      expect(hostnameSchema.safeParse('my-host').success).toBe(true);
    });

    it('accepts a single character hostname', () => {
      expect(hostnameSchema.safeParse('a').success).toBe(true);
    });

    it('accepts a numeric hostname', () => {
      expect(hostnameSchema.safeParse('123').success).toBe(true);
    });

    it('accepts a hostname with dots (FQDN)', () => {
      expect(hostnameSchema.safeParse('host.example.com').success).toBe(true);
    });

    it('accepts a hostname at max length (64 characters)', () => {
      const hostname = 'a'.repeat(64);
      expect(hostnameSchema.safeParse(hostname).success).toBe(true);
    });

    it('accepts hyphens in the middle', () => {
      expect(hostnameSchema.safeParse('my-cool-host').success).toBe(true);
    });

    it('accepts an empty string (hostname is not required)', () => {
      expect(hostnameSchema.safeParse('').success).toBe(true);
    });
  });

  describe('invalid hostnames', () => {
    it('rejects a hostname over 64 characters', () => {
      const hostname = 'a'.repeat(65);
      expect(hostnameSchema.safeParse(hostname).success).toBe(false);
    });

    it('rejects uppercase characters', () => {
      expect(hostnameSchema.safeParse('My-Host').success).toBe(false);
    });

    it('rejects a leading hyphen', () => {
      expect(hostnameSchema.safeParse('-my-host').success).toBe(false);
    });

    it('rejects a trailing hyphen', () => {
      expect(hostnameSchema.safeParse('my-host-').success).toBe(false);
    });

    it('rejects special characters', () => {
      expect(hostnameSchema.safeParse('my_host!').success).toBe(false);
    });

    it('rejects underscores', () => {
      expect(hostnameSchema.safeParse('my_host').success).toBe(false);
    });

    it('rejects spaces', () => {
      expect(hostnameSchema.safeParse('my host').success).toBe(false);
    });

    it('rejects a trailing dot', () => {
      expect(hostnameSchema.safeParse('host.').success).toBe(false);
    });

    it('rejects a leading dot', () => {
      expect(hostnameSchema.safeParse('.host').success).toBe(false);
    });

    it('rejects consecutive dots', () => {
      expect(hostnameSchema.safeParse('host..example').success).toBe(false);
    });
  });

  describe('rule-specific messages', () => {
    const messagesFor = (hostname: string) =>
      hostnameSchema.safeParse(hostname).error?.issues.map((i) => i.message) ??
      [];

    it('names the dot-placement rule for a leading dot', () => {
      expect(messagesFor('.invalid')).toContain(
        'Hostname cannot start or end with a dot.',
      );
    });

    it('names the consecutive-dots rule', () => {
      expect(messagesFor('a..b')).toContain(
        'Hostname cannot contain consecutive dots.',
      );
    });

    it('names the label-hyphen rule for a non-leading label', () => {
      expect(messagesFor('host.-label')).toContain(
        'Hostname labels cannot start or end with a hyphen.',
      );
    });

    it('reports every violation at once rather than short-circuiting', () => {
      expect(messagesFor('.-foo')).toEqual([
        'Hostname cannot start or end with a dot.',
        'Hostname labels cannot start or end with a hyphen.',
      ]);
    });
  });
});
