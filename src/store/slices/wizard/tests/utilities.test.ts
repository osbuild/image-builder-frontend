import { describe, expect, it } from 'vitest';
import z from 'zod';

import { uniqueArray } from '../utilities';

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
