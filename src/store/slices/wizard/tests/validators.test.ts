import { describe, expect, it } from 'vitest';
import z from 'zod';

import { uniqueArray } from '../utilities';
import { validateList, validateSchema } from '../validators';

const schema = z
  .array(z.string().regex(/^[a-z]+$/, 'Only lowercase letters allowed'))
  .superRefine(uniqueArray('item'));

describe('validateSchema', () => {
  it('returns parsed data for a valid value', () => {
    const result = validateSchema(z.string(), 'foo');

    expect(result).toEqual({ data: 'foo', issues: [] });
  });

  it('returns transformed data for a valid value', () => {
    const result = validateSchema(z.string().trim(), ' foo ');

    expect(result).toEqual({ data: 'foo', issues: [] });
  });

  it('maps schema violations to format issues', () => {
    const result = validateSchema(z.string().min(1, 'Value is required'), '');

    expect(result).toEqual({
      issues: [
        {
          message: 'Value is required',
          kind: 'format',
          value: '',
        },
      ],
    });
  });

  it('returns no issues and no data for an undefined value', () => {
    expect(validateSchema(z.string())).toEqual({
      data: undefined,
      issues: [],
    });
  });
});

describe('validateList', () => {
  it('returns parsed data and no issues for a valid list', () => {
    expect(validateList(schema, ['foo', 'bar'])).toEqual({
      data: ['foo', 'bar'],
      issues: [],
    });
  });

  it('returns parsed data and no issues for an empty list', () => {
    expect(validateList(schema, [])).toEqual({
      data: [],
      issues: [],
    });
  });

  it('maps a schema violation to a format issue', () => {
    const result = validateList(schema, ['FOO']);

    expect(result).toEqual({
      issues: [
        {
          message: 'Only lowercase letters allowed',
          kind: 'format',
          value: 'FOO',
        },
      ],
    });
  });

  it('maps a duplicate to a duplicate issue', () => {
    const result = validateList(schema, ['foo', 'foo']);

    expect(result).toEqual({
      issues: [
        {
          message: 'Duplicate item: foo',
          kind: 'duplicate',
          value: 'foo',
        },
      ],
    });
  });

  it('reports one format issue per invalid element', () => {
    const result = validateList(schema, ['FOO', 'BAR']);

    expect(result.issues).toHaveLength(2);
    expect(result.issues.every((issue) => issue.kind === 'format')).toBe(true);
  });

  it('returns no issues and no data for an undefined list', () => {
    expect(validateList(schema)).toEqual({
      data: undefined,
      issues: [],
    });
  });
});
