import { describe, expect, it } from 'vitest';

import { MAX_REGULAR_GID, MIN_REGULAR_GID } from '../../constants';
import { validateGroupList } from '../../validators';

const getGroupValidation = (gid?: number) =>
  validateGroupList([
    { name: 'developers', ...(gid === undefined ? {} : { gid }) },
  ]);

describe('group validation', () => {
  describe('group names', () => {
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
      expect(validateGroupList([{ name }]).errors).toEqual([]);
    });

    it.each([
      ['', 'empty group name'],
      ['12345', 'purely numeric group name'],
      ['invalid.group', 'group name containing a dot'],
      ['developers!', 'group name containing punctuation'],
      ['-developers', 'group name starting with a hyphen'],
      ['a'.repeat(33), 'group name over the maximum length'],
    ])('rejects %s as an invalid %s', (name) => {
      const { errors } = validateGroupList([{ name }]);

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'format',
            path: [0, 'name'],
          }),
        ]),
      );
      expect(
        errors.every(({ path }) => path?.[0] === 0 && path[1] === 'name'),
      ).toBe(true);
    });
  });

  describe('duplicate groups', () => {
    it('rejects duplicate group names', () => {
      const { errors } = validateGroupList([
        { name: 'developers', gid: 1000 },
        { name: 'developers', gid: 1001 },
      ]);

      expect(errors).toEqual([
        expect.objectContaining({
          kind: 'duplicate',
          message: 'Duplicate group names: developers',
          path: [1, 'name'],
        }),
      ]);
    });

    it('rejects duplicate GIDs', () => {
      const { errors } = validateGroupList([
        { name: 'developers', gid: 1000 },
        { name: 'operators', gid: 1000 },
      ]);

      expect(errors).toEqual([
        expect.objectContaining({
          kind: 'duplicate',
          message: 'Duplicate group ids: 1000',
          path: [1, 'gid'],
        }),
      ]);
    });
  });

  describe('GID warnings', () => {
    it.each([
      [undefined, 'omitted GID'],
      [MIN_REGULAR_GID, 'minimum standard GID'],
      [MAX_REGULAR_GID, 'maximum standard GID'],
      [1001, 'GID inside the standard range'],
    ])('does not warn for %s, the %s', (gid, _description) => {
      expect(getGroupValidation(gid).warnings).toEqual([]);
    });

    it.each([
      [MIN_REGULAR_GID - 1, `Standard GID should be above ${MIN_REGULAR_GID}`],
      [MAX_REGULAR_GID + 1, `Standard GID should be below ${MAX_REGULAR_GID}`],
    ])(
      'warns for an out-of-range GID: %i without blocking validation',
      (gid, message) => {
        const { errors, warnings } = getGroupValidation(gid);

        expect(errors).toEqual([]);
        expect(warnings).toEqual([
          expect.objectContaining({
            kind: 'format',
            message,
            path: [0, 'gid'],
          }),
        ]);
      },
    );

    it('retains range warnings alongside duplicate GID errors', () => {
      const { errors, warnings } = validateGroupList([
        { name: 'developers', gid: MIN_REGULAR_GID - 1 },
        { name: 'operators', gid: MIN_REGULAR_GID - 1 },
      ]);

      expect(errors).toEqual([
        expect.objectContaining({
          kind: 'duplicate',
          message: `Duplicate group ids: ${MIN_REGULAR_GID - 1}`,
          path: [1, 'gid'],
        }),
      ]);
      expect(warnings).toEqual([
        expect.objectContaining({
          message: `Standard GID should be above ${MIN_REGULAR_GID}`,
          path: [0, 'gid'],
        }),
        expect.objectContaining({
          message: `Standard GID should be above ${MIN_REGULAR_GID}`,
          path: [1, 'gid'],
        }),
      ]);
    });
  });
});
