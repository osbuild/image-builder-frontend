import { describe, expect, it } from 'vitest';

import { isUserGroupValid } from '@/Components/CreateImageWizard/validators';

import { MAX_REGULAR_GID, MIN_REGULAR_GID } from '../../constants';

const getGroupGidWarning = (gid?: number): string | undefined => {
  if (gid === undefined) {
    return undefined;
  }

  if (gid < MIN_REGULAR_GID || gid > MAX_REGULAR_GID) {
    return `Standard GID range is ${MIN_REGULAR_GID}–${MAX_REGULAR_GID}`;
  }

  return undefined;
};

describe('group validation', () => {
  describe('group names', () => {
    const isValid = isUserGroupValid;

    it.each([
      ['a', 'single letter'],
      ['developers', 'simple group name'],
      ['dev-ops', 'hyphenated group name'],
      ['dev_ops', 'underscored group name'],
      ['_developers', 'group name starting with an underscore'],
      ['developers$', 'group name ending with a dollar sign'],
      ['developers-', 'group name ending with a hyphen'],
      ['group123', 'group name with digits'],
      ['a'.repeat(32), 'group name at the maximum length'],
    ])('accepts %s as a valid %s', (name) => {
      expect(isValid(name)).toBe(true);
    });

    it.each([
      ['', 'empty group name'],
      ['12345', 'purely numeric group name'],
      ['invalid.group', 'group name containing a dot'],
      ['developers!', 'group name containing punctuation'],
      ['-developers', 'group name starting with a hyphen'],
      ['a'.repeat(33), 'group name over the maximum length'],
    ])('rejects %s as an invalid %s', (name) => {
      expect(isValid(name)).toBe(false);
    });
  });

  describe('GID warnings', () => {
    it.each([
      [undefined, 'omitted GID'],
      [MIN_REGULAR_GID, 'minimum standard GID'],
      [MAX_REGULAR_GID, 'maximum standard GID'],
      [1001, 'GID inside the standard range'],
    ])('does not warn for %s, the %s', (gid, _description) => {
      expect(getGroupGidWarning(gid)).toBeUndefined();
    });

    it.each([
      [MIN_REGULAR_GID - 1, 'below'],
      [MAX_REGULAR_GID + 1, 'above'],
    ])('warns for GID %i, which is %s the standard range', (gid, _position) => {
      expect(getGroupGidWarning(gid)).toBe(
        `Standard GID range is ${MIN_REGULAR_GID}–${MAX_REGULAR_GID}`,
      );
    });
  });
});
