import z from 'zod';

import { uniqueArray } from '../utilities';

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

export const kernelArgSchema = z
  .string()
  .max(256, 'Kernel argument must be no more than 256 characters.')
  .regex(
    // The allowlist intentionally permits bootloader/shell metacharacters
    // (#, \, ", ', ;) because they are valid in kernel arguments. The backend
    // is responsible for escaping these before writing them to the bootloader
    // config to prevent grub/bootloader injection.
    /^[a-zA-Z0-9=\-_,."'/:#+;\\]*$/,
    'Kernel argument contains invalid characters',
  );

export const kernelSchema = z.object({
  name: z.string(),
  append: z.array(kernelArgSchema).superRefine(uniqueArray('kernel argument')),
});
