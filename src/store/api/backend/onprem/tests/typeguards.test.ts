import { describe, expect, it } from 'vitest';

import { OnPremApiError } from '@/store/api/shared';

import {
  assertComposeResponse,
  assertComposeStatus,
  isComposeResponse,
  isComposeStatus,
} from '../typeguards';

describe('isComposeResponse', () => {
  it('should return true for a valid compose response', () => {
    expect(isComposeResponse({ id: 'abc-123' })).toBe(true);
  });

  it('should return true when extra properties are present', () => {
    expect(isComposeResponse({ id: 'abc-123', extra: 'data' })).toBe(true);
  });

  it('should return false when id is missing', () => {
    expect(isComposeResponse({})).toBe(false);
  });

  it('should return false when id is not a string', () => {
    expect(isComposeResponse({ id: 123 })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isComposeResponse(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isComposeResponse(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isComposeResponse('not-an-object')).toBe(false);
  });
});

describe('assertComposeResponse', () => {
  it('should return the value for a valid compose response', () => {
    const value = { id: 'abc-123' };
    const result = assertComposeResponse(value);

    expect(result).toBe(value);
  });

  it('should throw OnPremApiError for invalid data', () => {
    expect(() => assertComposeResponse({})).toThrow(OnPremApiError);
  });

  it('should throw with a user-friendly message', () => {
    expect(() => assertComposeResponse(null)).toThrow(
      'Image build request failed due to an unexpected response from the composer service',
    );
  });
});

describe('isComposeStatus', () => {
  it('should return true for a valid compose status', () => {
    expect(
      isComposeStatus({
        image_status: { status: 'success' },
      }),
    ).toBe(true);
  });

  it('should return true with additional image_status properties', () => {
    expect(
      isComposeStatus({
        image_status: { status: 'building', progress: 50 },
      }),
    ).toBe(true);
  });

  it('should return false when image_status is missing', () => {
    expect(isComposeStatus({})).toBe(false);
  });

  it('should return false when image_status is not an object', () => {
    expect(isComposeStatus({ image_status: 'done' })).toBe(false);
  });

  it('should return false when image_status.status is missing', () => {
    expect(isComposeStatus({ image_status: {} })).toBe(false);
  });

  it('should return false when image_status.status is not a string', () => {
    expect(isComposeStatus({ image_status: { status: 123 } })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isComposeStatus(null)).toBe(false);
  });
});

describe('assertComposeStatus', () => {
  it('should return the value for a valid compose status', () => {
    const value = { image_status: { status: 'success' } };
    const result = assertComposeStatus(value);

    expect(result).toBe(value);
  });

  it('should throw OnPremApiError for invalid data', () => {
    expect(() => assertComposeStatus({})).toThrow(OnPremApiError);
  });

  it('should throw with a user-friendly message', () => {
    expect(() => assertComposeStatus(null)).toThrow(
      'Unable to retrieve image build status due to an unexpected response',
    );
  });
});
