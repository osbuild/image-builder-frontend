import { describe, expect, it, vi } from 'vitest';

import { OnPremApiError } from '../errors';
import { onPremQueryHandler } from '../queryHandler';

// Minimal mock matching BaseQueryApi shape
const createMockApi = () =>
  ({
    signal: new AbortController().signal,
    abort: vi.fn(),
    dispatch: vi.fn(),
    getState: vi.fn(),
    extra: undefined,
    endpoint: 'test',
    type: 'query' as const,
  }) as const;

const mockBaseQuery = vi.fn();
const mockExtraOptions = {};

describe('onPremQueryHandler', () => {
  describe('success path', () => {
    it('should wrap the return value in { data }', async () => {
      const handler = onPremQueryHandler(async () => {
        return { id: '123' };
      });

      const result = await handler(
        {},
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toEqual({ data: { id: '123' } });
    });

    it('should pass queryArgs through to the handler function', async () => {
      const handler = onPremQueryHandler(
        async ({ queryArgs }: { queryArgs: { id: string } }) => {
          return queryArgs.id;
        },
      );

      const result = await handler(
        { id: 'test-id' },
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toEqual({ data: 'test-id' });
    });

    it('should pass baseQuery through to the handler function', async () => {
      const mockBq = vi.fn().mockResolvedValue({ data: 'response' });
      const handler = onPremQueryHandler(async ({ baseQuery }) => {
        return baseQuery({ url: '/test', method: 'GET' });
      });

      await handler({}, createMockApi(), mockExtraOptions, mockBq);

      expect(mockBq).toHaveBeenCalledWith({ url: '/test', method: 'GET' });
    });
  });

  describe('error path', () => {
    it('should catch an Error and return { error: { message } }', async () => {
      const handler = onPremQueryHandler(async () => {
        throw new Error('something broke');
      });

      const result = await handler(
        {},
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toEqual({ error: { message: 'something broke' } });
    });

    it('should catch an OnPremApiError and return { error: { message } }', async () => {
      const handler = onPremQueryHandler(async () => {
        throw new OnPremApiError('api failure');
      });

      const result = await handler(
        {},
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toEqual({ error: { message: 'api failure' } });
    });

    it('should catch a cockpit rejection object and preserve message, problem, and body', async () => {
      const handler = onPremQueryHandler(async () => {
        throw {
          problem: 'not-found',
          message: 'Resource not found',
          options: { url: '/api/test' },
          body: { details: 'No compose with that ID' },
        };
      });

      const result = await handler(
        {},
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toEqual({
        error: {
          message: 'Resource not found',
          problem: 'not-found',
          body: { details: 'No compose with that ID' },
        },
      });
    });

    it('should catch a bare string and return it as message', async () => {
      const handler = onPremQueryHandler(async () => {
        throw 'Unknown distribution';
      });

      const result = await handler(
        {},
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toEqual({ error: { message: 'Unknown distribution' } });
    });

    it('should never produce [object Object] as an error message', async () => {
      const handler = onPremQueryHandler(async () => {
        throw { problem: 'access-denied', message: 'Permission denied' };
      });

      const result = await handler(
        {},
        createMockApi(),
        mockExtraOptions,
        mockBaseQuery,
      );

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error.message).not.toBe('[object Object]');
      }
    });
  });
});
