import { describe, expect, it } from 'vitest';

import { OnPremApiError, toOnPremError } from '../errors';

describe('OnPremApiError', () => {
  it('should be an instance of Error', () => {
    const error = new OnPremApiError('test message');

    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const error = new OnPremApiError('test message');

    expect(error.name).toBe('OnPremApiError');
  });

  it('should store the message', () => {
    const error = new OnPremApiError('something went wrong');

    expect(error.message).toBe('something went wrong');
  });

  it('should have a stack trace', () => {
    const error = new OnPremApiError('test');

    expect(error.stack).toBeDefined();
  });
});

describe('toOnPremError', () => {
  it('should extract message from an Error instance', () => {
    const error = new Error('something failed');
    const result = toOnPremError(error);

    expect(result).toEqual({ message: 'something failed' });
  });

  it('should extract message from an OnPremApiError instance', () => {
    const error = new OnPremApiError('api failure');
    const result = toOnPremError(error);

    expect(result).toEqual({ message: 'api failure' });
  });

  it('should extract message, problem, and body from a cockpit rejection object', () => {
    const rejection = {
      problem: 'not-found',
      message: 'Resource not found',
      options: { url: '/api/test' },
      body: { details: 'No compose with that ID' },
    };
    const result = toOnPremError(rejection);

    expect(result).toEqual({
      message: 'Resource not found',
      problem: 'not-found',
      body: { details: 'No compose with that ID' },
    });
  });

  it('should extract message from a plain object without body or problem', () => {
    const obj = { message: 'some error' };
    const result = toOnPremError(obj);

    expect(result).toEqual({ message: 'some error' });
  });

  it('should handle a bare string', () => {
    const result = toOnPremError('Unknown distribution');

    expect(result).toEqual({ message: 'Unknown distribution' });
  });

  it('should handle a number', () => {
    const result = toOnPremError(42);

    expect(result).toEqual({ message: 'An unexpected error occurred' });
  });

  it('should handle null', () => {
    const result = toOnPremError(null);

    expect(result).toEqual({ message: 'An unexpected error occurred' });
  });

  it('should handle undefined', () => {
    const result = toOnPremError(undefined);

    expect(result).toEqual({ message: 'An unexpected error occurred' });
  });

  it('should produce a generic message for objects without message property', () => {
    const result = toOnPremError({ code: 404, details: 'not found' });

    expect(result.message).not.toBe('[object Object]');
    expect(result).toEqual({ message: 'An unexpected error occurred' });
  });

  it('should not produce [object Object] for plain objects with message', () => {
    const obj = { message: 'test', extra: 'data' };
    const result = toOnPremError(obj);

    expect(result.message).not.toBe('[object Object]');
    expect(result.message).toBe('test');
  });
});
