import z from 'zod';

import {
  checkJwtToken,
  checkPemBlocks,
  decodeCertificateString,
  normalizeCertificates,
} from './utilities';

export const registerNowLiterals = z.literal([
  'register-now',
  'register-now-insights',
  'register-now-rhc',
]);

export const registrationLiterals = z.union([
  registerNowLiterals,
  z.literal(['register-later', 'register-satellite', 'register-aap']),
]);

// NOTE: this schema has diverging input/output types:
// input -> string
// output -> string[]
// This is because a certificate string could contain
// multiple certificates
export const caCertSchema = z
  .string()
  .trim()
  .transform(decodeCertificateString)
  .superRefine(checkPemBlocks)
  .transform(normalizeCertificates);

export const satelliteCommandSchema = z
  .string()
  .trim()
  .refine((value) => value.length > 0, {
    error: 'Registration command is required',
    abort: true,
  })
  .superRefine(checkJwtToken);

export const satelliteRegistrationSchema = z.object({
  command: satelliteCommandSchema,
  caCert: caCertSchema.optional(),
});

export const registrationOptionsSchema = z.object({
  serverUrl: z.string(),
  baseUrl: z.string(),
  proxy: z.string().optional(),
  activationKey: z.string().optional(),
  orgId: z.string().optional(),
});

export const registrationSliceSchema = z.object({
  type: registrationLiterals,
  options: registrationOptionsSchema.optional(),
  satellite: satelliteRegistrationSchema.optional(),
});
