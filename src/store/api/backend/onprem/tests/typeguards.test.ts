import { describe, expect, it } from 'vitest';

import {
  isImageStatus,
  isUploadStatus,
} from '../typeguards';

describe('isImageStatus', () => {
  it('should return true for a valid image status', () => {
    expect(isImageStatus({
      status: 'abc-123',
      upload_status: { status: 'abc-123', type: 'abc-123' },
    })).toBe(true);
  });

  it('should return true when extra properties are present', () => {
    expect(isImageStatus({ status: 'abc-123', extra: 'data' })).toBe(true);
  });

  it('should return false when status is missing', () => {
    expect(isImageStatus({})).toBe(false);
  });

  it('should return false when status is not a string', () => {
    expect(isImageStatus({ status: 123 })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isImageStatus(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isImageStatus(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isImageStatus('not-an-object')).toBe(false);
  });
});

describe('isUploadStatus', () => {
  it('should return true for a valid upload status', () => {
    expect(
      isUploadStatus({
        status: 'success',
        type: 'abc-123',
      }),
    ).toBe(true);
  });

  it('should return true with additional properties', () => {
    expect(
      isUploadStatus({
        status: 'building',
        type: 'abc-123',
        progress: 50,
      }),
    ).toBe(true);
  });

  it('should return false when status is missing', () => {
    expect(isUploadStatus({})).toBe(false);
  });

  it('should return false when status is not a string', () => {
    expect(isUploadStatus({ status: 123, type: 'abc-123' })).toBe(false);
  });

  it('should return false when type is not a string', () => {
    expect(isUploadStatus({ status: 'abc-123', type: 123 })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isUploadStatus(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isUploadStatus(undefined)).toBe(false);
  });
});
