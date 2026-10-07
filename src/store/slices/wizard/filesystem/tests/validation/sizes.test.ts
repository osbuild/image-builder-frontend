import { describe, expect, it } from 'vitest';

import {
  isDiskMinSizeValid,
  isMountpointMinSizeValid,
} from '@/Components/CreateImageWizard/validators';

describe('filesystem size validation', () => {
  describe('mountpoint minimum size', () => {
    it.each(['1', '10', '001'])('accepts positive integer %s', (size) => {
      expect(isMountpointMinSizeValid(size)).toBe(true);
    });

    it.each(['', '0', '-1', '1.5', ' 1'])('rejects invalid size %s', (size) => {
      expect(isMountpointMinSizeValid(size)).toBe(false);
    });
  });

  describe('disk minimum size', () => {
    it.each(['0', '10', '001'])('accepts non-negative integer %s', (size) => {
      expect(isDiskMinSizeValid(size)).toBe(true);
    });

    it.each(['', '-1', '1.5', ' 1'])('rejects invalid size %s', (size) => {
      expect(isDiskMinSizeValid(size)).toBe(false);
    });
  });
});
