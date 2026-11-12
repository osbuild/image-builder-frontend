import { describe, expect, it } from 'vitest';

import {
  INVALID_SATELLITE_COMMAND,
  SATELLITE_COMMAND_EXPIRED_TOKEN,
  SATELLITE_COMMAND_NO_EXPIRATION,
  VALID_SATELLITE_COMMAND,
} from '@/Components/CreateImageWizard/steps/Registration/tests/mocks/fixtures';
import { validateSatelliteCommand } from '@/Components/CreateImageWizard/validators';

const currentTimeSeconds = Date.parse('2027-01-01T00:00:00Z') / 1000;

describe('Satellite command validation', () => {
  it('rejects an empty command', () => {
    expect(validateSatelliteCommand(undefined, currentTimeSeconds)).toEqual({
      command: 'No registration command for Satellite registration',
    });
  });

  it('rejects a command without a bearer token', () => {
    expect(
      validateSatelliteCommand(INVALID_SATELLITE_COMMAND, currentTimeSeconds),
    ).toEqual({ command: 'Invalid or missing token' });
  });

  it('rejects an expired token', () => {
    expect(
      validateSatelliteCommand(
        SATELLITE_COMMAND_EXPIRED_TOKEN,
        currentTimeSeconds,
      ),
    ).toEqual({
      expired: expect.stringContaining(
        'The token is already expired or will expire by next day.',
      ),
    });
  });

  it.each([
    ['without expiration', SATELLITE_COMMAND_NO_EXPIRATION],
    ['with a future expiration', VALID_SATELLITE_COMMAND],
  ])('accepts a valid token %s', (_case, command) => {
    expect(validateSatelliteCommand(command, currentTimeSeconds)).toEqual({});
  });
});
