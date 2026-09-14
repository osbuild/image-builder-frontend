import { describe, expect, it } from 'vitest';
import z from 'zod';

import { uniqueArray, uniqueBy } from '../utilities';

const schema = z.array(z.string()).superRefine(uniqueArray('item'));

describe('uniqueArray', () => {
  it('accepts an empty array', () => {
    const result = schema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it('accepts an array with no duplicates', () => {
    const result = schema.safeParse(['a', 'b', 'c']);
    expect(result.success).toBe(true);
  });

  it('rejects an array with a duplicate', () => {
    const result = schema.safeParse(['a', 'b', 'a']);
    expect(result.success).toBe(false);
  });

  it('reports one issue per duplicate occurrence', () => {
    const result = schema.safeParse(['a', 'a', 'a']);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(2);
    }
  });

  it('includes the label and offending value in the message', () => {
    const result = schema.safeParse(['dup', 'dup']);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Duplicate item: dup');
    }
  });

  it('attaches the offending value under params', () => {
    const result = schema.safeParse(['dup', 'dup']);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      expect(issue.code).toBe('custom');
      if (issue.code === 'custom') {
        expect(issue.params?.value).toBe('dup');
      }
    }
  });
});

type NamedItem = {
  name: string;
};

const namedItemsSchema = z
  .array(z.object({ name: z.string() }))
  .superRefine(
    uniqueBy<NamedItem, string>('item name', 'name', (item) => item.name),
  );

const identifiedItemSchema = z.object({ id: z.number().optional() });
type IdentifiedItem = z.infer<typeof identifiedItemSchema>;

const identifiedItemsSchema = z
  .array(identifiedItemSchema)
  .superRefine(
    uniqueBy<IdentifiedItem, number>('item IDs', 'id', (item) => item.id),
  );

describe('uniqueBy', () => {
  it('accepts an array with no duplicate numeric values', () => {
    const result = identifiedItemsSchema.safeParse([{ id: 1 }, { id: 2 }]);

    expect(result.success).toBe(true);
  });

  it('ignores undefined numeric values', () => {
    const result = identifiedItemsSchema.safeParse([{}, {}]);

    expect(result.success).toBe(true);
  });

  it('reports duplicate numeric values at the configured field path', () => {
    const result = identifiedItemsSchema.safeParse([
      { id: 1000 },
      { id: 1000 },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([1, 'id']);
      expect(result.error.issues[0].message).toBe('Duplicate item IDs: 1000');
    }
  });

  it('accepts an array with no duplicates', () => {
    const result = namedItemsSchema.safeParse([{ name: 'a' }, { name: 'b' }]);

    expect(result.success).toBe(true);
  });

  it('ignores empty values', () => {
    const result = namedItemsSchema.safeParse([{ name: '' }, { name: '' }]);

    expect(result.success).toBe(true);
  });

  it('reports duplicate values at the item name path', () => {
    const result = namedItemsSchema.safeParse([
      { name: 'duplicate' },
      { name: 'duplicate' },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual([1, 'name']);
      expect(result.error.issues[0].message).toBe(
        'Duplicate item name: duplicate',
      );
    }
  });

  it('reports each duplicate occurrence and includes the value', () => {
    const result = namedItemsSchema.safeParse([
      { name: 'duplicate' },
      { name: 'duplicate' },
      { name: 'duplicate' },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(2);
      result.error.issues.forEach((issue) => {
        expect(issue.code).toBe('custom');
        if (issue.code === 'custom') {
          expect(issue.params?.value).toBe('duplicate');
        }
      });
    }
  });
});
