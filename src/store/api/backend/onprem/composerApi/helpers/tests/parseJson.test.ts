import { describe, expect, it } from 'vitest';

import { parseJsonUnsafe } from '../parseJson';

type TestData = {
  name: string;
  value: number;
};

describe('asJson', () => {
  it('parses a valid JSON string', () => {
    const input = '{"name":"test","value":42}';
    const result = parseJsonUnsafe<TestData>(input);
    expect(result).toEqual({ name: 'test', value: 42 });
  });

  it('parses a JSON array', () => {
    const input = '[1, 2, 3]';
    const result = parseJsonUnsafe<number[]>(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('throws when given invalid JSON', () => {
    expect(() => parseJsonUnsafe('not valid json{{{')).toThrow(
      'Unable to convert result to JSON',
    );
  });

  it('throws when given an empty string', () => {
    expect(() => parseJsonUnsafe('')).toThrow(
      'Unable to convert result to JSON',
    );
  });
});
