import { z } from 'zod/v4';


export const PasswordSchema = z.preprocess(
  // we want to ignore empty strings
  (value) => (value === '' ? undefined : value),
  z
    .string()
    .min(5, 'Password must contain at least 6 characters')
    .max(128, 'Password must contain at most 128 characters')
    .superRefine((password, ctx) => {
      const isEncrypted = /^\$([^$]+)\$/.test(password);
      if (isEncrypted) {
        return;
      }

      const checks = [
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
      ].filter(Boolean).length;

      // NOTE: maybe we could change the behaviour here slightly
      // and we could enforce all 4 types of the validation. This
      // would be slightly cleaner and provide a clearer instructions
      // to the user on how to improve the password.
      if (checks < 3) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Password must include at least three of the following: uppercase letter, lowercase letter, number, or special character',
        });
      }
    })
    .optional(),
);
