import { describe, expect, it } from 'vitest';

import { isDefined, isNonNullObject } from '../typeguards';

describe('isDefined', () => {
  it('should return false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });

  it('should return true for zero', () => {
    expect(isDefined(0)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isDefined('')).toBe(true);
  });

  it('should return true for false', () => {
    expect(isDefined(false)).toBe(true);
  });

  it('should return true for an object', () => {
    expect(isDefined({ key: 'value' })).toBe(true);
  });

  it('should return true for an empty array', () => {
    expect(isDefined([])).toBe(true);
  });
});

describe('isNonNullObject', () => {
  it('should return false for null', () => {
    expect(isNonNullObject(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNonNullObject(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isNonNullObject('hello')).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isNonNullObject(42)).toBe(false);
  });

  it('should return false for a boolean', () => {
    expect(isNonNullObject(true)).toBe(false);
  });

  it('should return true for a plain object', () => {
    expect(isNonNullObject({ key: 'value' })).toBe(true);
  });

  it('should return true for an empty object', () => {
    expect(isNonNullObject({})).toBe(true);
  });

  it('should return false for an array', () => {
    expect(isNonNullObject([])).toBe(false);
  });
});
