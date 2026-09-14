import { describe, expect, it } from 'vitest';

import { splitKernelArgs } from './splitKernelArgs';

describe('splitKernelArgs', () => {
  it('splits simple space-separated arguments', () => {
    expect(splitKernelArgs('nosmt=force audit=1')).toEqual([
      'nosmt=force',
      'audit=1',
    ]);
  });

  it('preserves double-quoted values with spaces', () => {
    expect(splitKernelArgs('var="i have spaces" audit=1')).toEqual([
      'var="i have spaces"',
      'audit=1',
    ]);
  });

  it('preserves single-quoted values with spaces', () => {
    expect(splitKernelArgs("var='i have spaces' audit=1")).toEqual([
      "var='i have spaces'",
      'audit=1',
    ]);
  });

  it('handles multiple quoted arguments', () => {
    expect(splitKernelArgs('a="1 2" b=\'3 4\' c=5')).toEqual([
      'a="1 2"',
      "b='3 4'",
      'c=5',
    ]);
  });

  it('handles a single argument', () => {
    expect(splitKernelArgs('quiet')).toEqual(['quiet']);
  });

  it('returns empty array for empty string', () => {
    expect(splitKernelArgs('')).toEqual([]);
  });

  it('collapses multiple spaces between arguments', () => {
    expect(splitKernelArgs('a  b   c')).toEqual(['a', 'b', 'c']);
  });

  it('ignores leading and trailing spaces', () => {
    expect(splitKernelArgs('  a b  ')).toEqual(['a', 'b']);
  });
});
