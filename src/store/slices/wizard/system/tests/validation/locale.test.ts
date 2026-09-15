import { describe, expect, it } from 'vitest';

import { validateKeyboard, validateLanguages } from '@/store/slices/wizard';

describe('locale validation', () => {
  describe('languages', () => {
    it('accepts a supported language', () => {
      expect(validateLanguages(['en_US.UTF-8']).errors).toEqual([]);
    });

    it('accepts the default C locale', () => {
      expect(validateLanguages(['C.UTF-8']).errors).toEqual([]);
    });

    it('accepts multiple supported languages', () => {
      expect(
        validateLanguages(['en_US.UTF-8', 'de_DE.UTF-8', 'nl_NL.UTF-8']).errors,
      ).toEqual([]);
    });

    it('rejects an unknown language', () => {
      expect(validateLanguages(['xx_XX.UTF-8']).errors).toEqual([
        {
          kind: 'format',
          message: 'Unknown language',
          value: 'xx_XX.UTF-8',
        },
      ]);
    });

    it('accepts an empty or omitted language list', () => {
      expect(validateLanguages([]).errors).toEqual([]);
      expect(validateLanguages().errors).toEqual([]);
    });

    it('flags duplicate languages', () => {
      expect(validateLanguages(['en_US.UTF-8', 'en_US.UTF-8']).errors).toEqual([
        {
          kind: 'duplicate',
          message: 'Duplicate languages: en_US.UTF-8',
          value: 'en_US.UTF-8',
        },
      ]);
    });
  });

  describe('keyboards', () => {
    it('accepts a supported keyboard', () => {
      expect(validateKeyboard('us').errors).toEqual([]);
    });

    it('accepts a keyboard with a variant', () => {
      expect(validateKeyboard('us-dvorak').errors).toEqual([]);
    });

    it('rejects an unknown keyboard', () => {
      expect(validateKeyboard('unknown-keyboard').errors).toEqual([
        {
          kind: 'format',
          message: 'Unknown keyboard',
          value: 'unknown-keyboard',
        },
      ]);
    });

    it('accepts an empty or omitted keyboard', () => {
      expect(validateKeyboard('').errors).toEqual([]);
      expect(validateKeyboard().errors).toEqual([]);
    });
  });
});
