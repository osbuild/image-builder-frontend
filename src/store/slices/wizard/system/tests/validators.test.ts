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
  });

  describe('invalid hostnames', () => {
    it('rejects an empty string', () => {
      expect(hostnameSchema.safeParse('').success).toBe(false);
    });

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
});
