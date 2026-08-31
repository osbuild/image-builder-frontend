import { describe, expect, it } from 'vitest';
import z from 'zod';

import { uniqueArray } from '../utilities';
import { validateList } from '../validators';

const schema = z
  .array(z.string().regex(/^[a-z]+$/, 'Only lowercase letters allowed'))
  .superRefine(uniqueArray('item'));

describe('validateList', () => {
  it('returns no issues for a valid list', () => {
    expect(validateList(schema, ['foo', 'bar'])).toEqual([]);
  });

  it('returns no issues for an empty list', () => {
    expect(validateList(schema, [])).toEqual([]);
  });

  it('maps a schema violation to a format issue', () => {
    const result = validateList(schema, ['FOO']);
    expect(result).toEqual([
      {
        message: 'Only lowercase letters allowed',
        kind: 'format',
        value: 'FOO',
      },
    ]);
  });

  it('maps a duplicate to a duplicate issue', () => {
    const result = validateList(schema, ['foo', 'foo']);
    expect(result).toEqual([
      {
        message: 'Duplicate item: foo',
        kind: 'duplicate',
        value: 'foo',
      },
    ]);
  });

  it('reports one format issue per invalid element', () => {
    const result = validateList(schema, ['FOO', 'BAR']);
    expect(result).toHaveLength(2);
    expect(result.every((issue) => issue.kind === 'format')).toBe(true);
  });
});
