import { z } from 'zod/v4';

export const UsernameSchema = z
  .string()
  .max(32, 'The username cannot be longer than 32 characters')
  .regex(/^(?!\d+$).+$/, 'The username must contain atleast one letter')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9_$]$/,
    'The username must be alphanumeric only',
  );
