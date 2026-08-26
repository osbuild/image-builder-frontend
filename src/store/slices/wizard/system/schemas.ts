import z from 'zod';

export const hostnameSchema = z
  .string()
  .max(64, 'Hostname must be no more than 64 characters.')
  // TODO: Consider splitting this complex regex into multiple Zod .regex() / .refine()
  // checks to provide more specific, user-friendly error messages (e.g., "cannot contain
  // consecutive dots", "cannot start with hyphen", etc.)
  .regex(
    /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/,
    'Invalid hostname. The hostname should be composed of 7-bit ASCII lower-case alphanumeric characters or hyphens forming a valid DNS domain name. It is recommended that this name contains only a single label, i.e. without any dots.',
  );
