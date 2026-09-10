import { describe, expect, it } from 'vitest';

import { keyboardsList } from '@/Components/CreateImageWizard/steps/Locale/data/keyboardsList';
import { languagesList } from '@/Components/CreateImageWizard/steps/Locale/data/languagesList';

const isLanguageValid = (language: string) => languagesList.includes(language);
const isKeyboardValid = (keyboard: string) =>
  keyboard === '' || keyboardsList.includes(keyboard);

const getDuplicateLanguages = (languages: string[]) => [
  ...new Set(
    languages.filter(
      (language, index) => languages.indexOf(language) !== index,
    ),
  ),
];

describe('locale validation', () => {
  describe('languages', () => {
    it('accepts a supported language', () => {
      expect(isLanguageValid('en_US.UTF-8')).toBe(true);
    });

    it('accepts the default C locale', () => {
      expect(isLanguageValid('C.UTF-8')).toBe(true);
    });

    it('accepts multiple supported languages', () => {
      expect(
        ['en_US.UTF-8', 'de_DE.UTF-8', 'nl_NL.UTF-8'].every(isLanguageValid),
      ).toBe(true);
    });

    it('rejects an unknown language', () => {
      expect(isLanguageValid('xx_XX.UTF-8')).toBe(false);
    });

    it('allows an empty language list', () => {
      expect([].every(isLanguageValid)).toBe(true);
    });
  });

  describe('duplicate languages', () => {
    it('returns no duplicates for unique languages', () => {
      expect(getDuplicateLanguages(['en_US.UTF-8', 'de_DE.UTF-8'])).toEqual([]);
    });

    it('identifies a duplicate language', () => {
      expect(getDuplicateLanguages(['en_US.UTF-8', 'en_US.UTF-8'])).toEqual([
        'en_US.UTF-8',
      ]);
    });

    it('reports each duplicate only once', () => {
      expect(
        getDuplicateLanguages(['en_US.UTF-8', 'en_US.UTF-8', 'en_US.UTF-8']),
      ).toEqual(['en_US.UTF-8']);
    });
  });

  describe('keyboards', () => {
    it('accepts a supported keyboard', () => {
      expect(isKeyboardValid('us')).toBe(true);
    });

    it('accepts a keyboard with a variant', () => {
      expect(isKeyboardValid('us-dvorak')).toBe(true);
    });

    it('rejects an unknown keyboard', () => {
      expect(isKeyboardValid('unknown-keyboard')).toBe(false);
    });

    it('allows an empty keyboard', () => {
      expect(isKeyboardValid('')).toBe(true);
    });
  });
});
