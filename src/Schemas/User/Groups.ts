import { z } from 'zod/v4';

import { unique } from '../helpers';

// see `man groupadd` for the exact specification
export const GroupsSchema = z
  .array(
    z
      .string()
      .max(32, 'The group cannot be longer than 32 characters')
      .regex(/^(?!\d+$).+$/, 'The groupname must contain at least one letter')
      // TODO: more descriptive error message
      .regex(/^[a-zA-Z0-9_][a-zA-Z0-9_-]*(\$)?$/, 'invalid group'),
  )
  // we have to parse a callback to zod's superRefine
  // function in order to validate item uniqueness
  .superRefine(unique('group'))
  .optional();
