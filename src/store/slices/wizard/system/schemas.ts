import z from 'zod';

export const hostnameSchema = z
  .string()
  .max(64, 'Hostname must be no more than 64 characters.')
  .regex(
    /^[a-z0-9.-]*$/,
    'Hostname may only contain lowercase letters, digits, hyphens, and dots.',
  )
  .refine((hostname) => !hostname.startsWith('.') && !hostname.endsWith('.'), {
    error: 'Hostname cannot start or end with a dot.',
  })
  .refine((hostname) => !hostname.includes('..'), {
    error: 'Hostname cannot contain consecutive dots.',
  })
  .refine(
    (hostname) =>
      hostname
        .split('.')
        .every((label) => !label.startsWith('-') && !label.endsWith('-')),
    { error: 'Hostname labels cannot start or end with a hyphen.' },
  );
