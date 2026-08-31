import { describe, expect, it } from 'vitest';

import { validateKernelArgs } from '../../validators';

const isValid = (arg: string) => validateKernelArgs([arg]).length === 0;

describe('kernel validation', () => {
  describe('valid kernel arguments', () => {
    it('accepts a simple key=value argument', () => {
      expect(isValid('quiet')).toBe(true);
    });

    it('accepts an argument with equals sign', () => {
      expect(isValid('root=/dev/sda1')).toBe(true);
    });

    it('accepts an argument with hyphens', () => {
      expect(isValid('no-scroll')).toBe(true);
    });

    it('accepts an argument with underscores', () => {
      expect(isValid('net_ifnames=0')).toBe(true);
    });

    it('accepts an argument with dots', () => {
      expect(isValid('systemd.unit=rescue.target')).toBe(true);
    });

    it('accepts an argument with commas', () => {
      expect(isValid('console=ttyS0,115200')).toBe(true);
    });

    it('accepts an argument with quotes', () => {
      expect(isValid("key='value'")).toBe(true);
    });

    it('accepts an argument with double quotes', () => {
      expect(isValid('key="value"')).toBe(true);
    });

    it('accepts an argument with colons', () => {
      expect(isValid('rd.lvm.lv=vg/lv')).toBe(true);
    });

    it('accepts an argument with hash', () => {
      expect(isValid('arg#1')).toBe(true);
    });

    it('accepts an argument with plus', () => {
      expect(isValid('arg+1')).toBe(true);
    });

    it('accepts an argument with semicolon', () => {
      expect(isValid('arg;next')).toBe(true);
    });

    it('accepts an argument with backslash', () => {
      expect(isValid('path\\to')).toBe(true);
    });

    it('accepts an argument at the maximum length', () => {
      expect(isValid('a'.repeat(256))).toBe(true);
    });

    it('returns no issues for an empty list', () => {
      expect(validateKernelArgs([])).toEqual([]);
    });
  });

  describe('invalid kernel arguments', () => {
    it('rejects an argument with spaces', () => {
      expect(isValid('key value')).toBe(false);
    });

    it('rejects an argument with exclamation mark', () => {
      expect(isValid('arg!')).toBe(false);
    });

    it('rejects an argument with ampersand', () => {
      expect(isValid('arg&next')).toBe(false);
    });

    it('rejects an argument with pipe', () => {
      expect(isValid('arg|next')).toBe(false);
    });

    it('rejects an argument with parentheses', () => {
      expect(isValid('arg(1)')).toBe(false);
    });

    it('rejects an argument with angle brackets', () => {
      expect(isValid('arg<1>')).toBe(false);
    });

    it('rejects an argument longer than the maximum length', () => {
      expect(isValid('a'.repeat(257))).toBe(false);
    });
  });

  describe('duplicate kernel arguments', () => {
    it('accepts a list with no duplicates', () => {
      expect(validateKernelArgs(['quiet', 'splash'])).toEqual([]);
    });

    it('rejects a list with a duplicate argument', () => {
      const result = validateKernelArgs(['quiet', 'quiet']);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        kind: 'duplicate',
        value: 'quiet',
      });
    });
  });
});
