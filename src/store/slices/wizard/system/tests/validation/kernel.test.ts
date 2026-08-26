import { describe, expect, it } from 'vitest';

import { isKernelArgumentValid } from '@/Components/CreateImageWizard/validators';

describe('kernel validation', () => {
  describe('valid kernel arguments', () => {
    it('accepts a simple key=value argument', () => {
      expect(isKernelArgumentValid('quiet')).toBe(true);
    });

    it('accepts an argument with equals sign', () => {
      expect(isKernelArgumentValid('root=/dev/sda1')).toBe(true);
    });

    it('accepts an argument with hyphens', () => {
      expect(isKernelArgumentValid('no-scroll')).toBe(true);
    });

    it('accepts an argument with underscores', () => {
      expect(isKernelArgumentValid('net_ifnames=0')).toBe(true);
    });

    it('accepts an argument with dots', () => {
      expect(isKernelArgumentValid('systemd.unit=rescue.target')).toBe(true);
    });

    it('accepts an argument with commas', () => {
      expect(isKernelArgumentValid('console=ttyS0,115200')).toBe(true);
    });

    it('accepts an argument with quotes', () => {
      expect(isKernelArgumentValid("key='value'")).toBe(true);
    });

    it('accepts an argument with double quotes', () => {
      expect(isKernelArgumentValid('key="value"')).toBe(true);
    });

    it('accepts an argument with colons', () => {
      expect(isKernelArgumentValid('rd.lvm.lv=vg/lv')).toBe(true);
    });

    it('accepts an argument with hash', () => {
      expect(isKernelArgumentValid('arg#1')).toBe(true);
    });

    it('accepts an argument with plus', () => {
      expect(isKernelArgumentValid('arg+1')).toBe(true);
    });

    it('accepts an argument with semicolon', () => {
      expect(isKernelArgumentValid('arg;next')).toBe(true);
    });

    it('accepts an argument with backslash', () => {
      expect(isKernelArgumentValid('path\\to')).toBe(true);
    });

    it('accepts an empty string', () => {
      expect(isKernelArgumentValid('')).toBe(true);
    });
  });

  describe('invalid kernel arguments', () => {
    it('rejects an argument with spaces', () => {
      expect(isKernelArgumentValid('key value')).toBe(false);
    });

    it('rejects an argument with exclamation mark', () => {
      expect(isKernelArgumentValid('arg!')).toBe(false);
    });

    it('rejects an argument with ampersand', () => {
      expect(isKernelArgumentValid('arg&next')).toBe(false);
    });

    it('rejects an argument with pipe', () => {
      expect(isKernelArgumentValid('arg|next')).toBe(false);
    });

    it('rejects an argument with parentheses', () => {
      expect(isKernelArgumentValid('arg(1)')).toBe(false);
    });

    it('rejects an argument with angle brackets', () => {
      expect(isKernelArgumentValid('arg<1>')).toBe(false);
    });
  });
});
