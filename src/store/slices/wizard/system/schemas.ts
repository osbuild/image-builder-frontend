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

export const serviceSchema = z
  .string()
  .max(256, 'Service name must be 256 characters or fewer')
  // see `man systemd.unit` for the exact specification. The character-set and
  // start/end rules are checked separately so each failure names its own rule
  // instead of collapsing into one generic message.
  .regex(
    /^[a-zA-Z0-9.\-_:@]*$/,
    'Service name may only contain letters, digits, and . - _ : @',
  )
  .regex(/^[a-zA-Z0-9]/, 'Service name must start with a letter or digit')
  .regex(/[a-zA-Z0-9]$/, 'Service name must end with a letter or digit')
  .regex(/^(?!.*--)/, 'Service name must not contain consecutive hyphens')
  .regex(/[a-zA-Z]+/, 'Service name must contain at least one letter');

export const servicesSchema = z.object({
  enabled: z.array(serviceSchema).superRefine(uniqueArray('enabled services')),
  masked: z.array(serviceSchema).superRefine(uniqueArray('masked services')),
  disabled: z
    .array(serviceSchema)
    .superRefine(uniqueArray('disabled services')),
});
