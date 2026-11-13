import { describe, expect, it } from 'vitest';

import {
  INVALID_SATELLITE_COMMAND,
  SATELLITE_COMMAND_EXPIRED_TOKEN,
  SATELLITE_COMMAND_NO_EXPIRATION,
  VALID_SATELLITE_COMMAND,
} from '@/Components/CreateImageWizard/steps/Registration/tests/mocks/fixtures';
import { validateSatelliteCommand } from '@/store/slices/wizard';

describe('Satellite command validation', () => {
  it('rejects an empty command', () => {
    const result = validateSatelliteCommand('');

    expect(result.data).toBeUndefined();
    expect(result.errors).toContainEqual(
      expect.objectContaining({ message: 'Registration command is required' }),
    );
  });

  it('rejects a command without a bearer token', () => {
    const result = validateSatelliteCommand(INVALID_SATELLITE_COMMAND);

    expect(result.data).toBeUndefined();
    expect(result.errors).toContainEqual(
      expect.objectContaining({ message: 'Invalid or missing token' }),
    );
  });

  it('rejects an expired token', () => {
    const result = validateSatelliteCommand(SATELLITE_COMMAND_EXPIRED_TOKEN);

    expect(result.data).toBeUndefined();
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining(
          'The token is already expired or will expire within 24 hours.',
        ),
      }),
    );
  });

  it.each([
    ['without expiration', SATELLITE_COMMAND_NO_EXPIRATION],
    ['with a future expiration', VALID_SATELLITE_COMMAND],
  ])('accepts a valid token %s', (_case, command) => {
    expect(validateSatelliteCommand(command)).toEqual({
      data: command.trim(),
      errors: [],
    });
  });
});
