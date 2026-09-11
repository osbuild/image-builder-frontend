import { describe, expect, it } from 'vitest';

import {
  validateKeyboard,
  validateLanguages,
  validateLocale,
} from '@/store/slices/wizard';

describe('locale validation', () => {
  describe('languages', () => {
    it('accepts a supported language', () => {
      expect(validateLanguages(['en_US.UTF-8'])).toEqual([]);
    });

    it('accepts the default C locale', () => {
      expect(validateLanguages(['C.UTF-8'])).toEqual([]);
    });

    it('accepts multiple supported languages', () => {
      expect(
        validateLanguages(['en_US.UTF-8', 'de_DE.UTF-8', 'nl_NL.UTF-8']),
      ).toEqual([]);
    });

    it('rejects an unknown language', () => {
      expect(validateLanguages(['xx_XX.UTF-8'])).toEqual([
        {
          kind: 'format',
          message: 'Unknown language',
          value: 'xx_XX.UTF-8',
        },
      ]);
    });

    it('accepts an empty or omitted language list', () => {
      expect(validateLanguages([])).toEqual([]);
      expect(validateLanguages()).toEqual([]);
    });

    it('flags duplicate languages', () => {
      expect(validateLanguages(['en_US.UTF-8', 'en_US.UTF-8'])).toEqual([
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
      expect(validateKeyboard('us')).toEqual([]);
    });

    it('accepts a keyboard with a variant', () => {
      expect(validateKeyboard('us-dvorak')).toEqual([]);
    });

    it('rejects an unknown keyboard', () => {
      expect(validateKeyboard('unknown-keyboard')).toEqual([
        {
          kind: 'format',
          message: 'Unknown keyboard',
          value: 'unknown-keyboard',
        },
      ]);
    });

    it('accepts an empty or omitted keyboard', () => {
      expect(validateKeyboard('')).toEqual([]);
      expect(validateKeyboard()).toEqual([]);
    });
  });

  describe('locale objects', () => {
    it('accepts an empty locale object', () => {
      expect(validateLocale({})).toEqual([]);
    });

    it('accepts a locale with languages and a keyboard', () => {
      expect(
        validateLocale({
          languages: ['en_US.UTF-8', 'de_DE.UTF-8'],
          keyboard: 'us',
        }),
      ).toEqual([]);
    });

    it('reports invalid languages and keyboard values', () => {
      const result = validateLocale({
        languages: ['xx_XX.UTF-8'],
        keyboard: 'unknown-keyboard',
      });

      expect(result).toHaveLength(2);
      expect(result.map(({ message }) => message)).toEqual([
        'Unknown language',
        'Unknown keyboard',
      ]);
    });
  });
});
