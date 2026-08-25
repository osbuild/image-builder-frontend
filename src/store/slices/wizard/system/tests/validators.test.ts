import { describe, expect, it } from 'vitest';

import { isHostnameValid } from '@/Components/CreateImageWizard/validators';

describe('hostname validation', () => {
  describe('valid hostnames', () => {
    it('accepts a simple hostname', () => {
      expect(isHostnameValid('my-host')).toBe(true);
    });

    it('accepts a single character hostname', () => {
      expect(isHostnameValid('a')).toBe(true);
    });

    it('accepts a numeric hostname', () => {
      expect(isHostnameValid('123')).toBe(true);
    });

    it('accepts a hostname with dots (FQDN)', () => {
      expect(isHostnameValid('host.example.com')).toBe(true);
    });

    it('accepts a hostname at max length (64 characters)', () => {
      const hostname = 'a'.repeat(64);
      expect(isHostnameValid(hostname)).toBe(true);
    });

    it('accepts hyphens in the middle', () => {
      expect(isHostnameValid('my-cool-host')).toBe(true);
    });
  });

  describe('invalid hostnames', () => {
    it('rejects an empty string', () => {
      expect(isHostnameValid('')).toBe(false);
    });

    it('rejects a hostname over 64 characters', () => {
      const hostname = 'a'.repeat(65);
      expect(isHostnameValid(hostname)).toBe(false);
    });

    it('rejects uppercase characters', () => {
      expect(isHostnameValid('My-Host')).toBe(false);
    });

    it('rejects a leading hyphen', () => {
      expect(isHostnameValid('-my-host')).toBe(false);
    });

    it('rejects a trailing hyphen', () => {
      expect(isHostnameValid('my-host-')).toBe(false);
    });

    it('rejects special characters', () => {
      expect(isHostnameValid('my_host!')).toBe(false);
    });

    it('rejects underscores', () => {
      expect(isHostnameValid('my_host')).toBe(false);
    });

    it('rejects spaces', () => {
      expect(isHostnameValid('my host')).toBe(false);
    });

    it('rejects a trailing dot', () => {
      expect(isHostnameValid('host.')).toBe(false);
    });

    it('rejects a leading dot', () => {
      expect(isHostnameValid('.host')).toBe(false);
    });

    it('rejects consecutive dots', () => {
      expect(isHostnameValid('host..example')).toBe(false);
    });
  });
});
