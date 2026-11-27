import z from 'zod';

import { MAX_CERTIFICATE_BYTES } from './constants';
import {
  checkJwtToken,
  checkPemBlocks,
  decodeCertificateString,
  normalizeCertificates,
} from './utilities';

export const registrationLiterals = z.literal([
  'register-now',
  'register-later',
  'register-satellite',
  'register-aap',
]);

export const activationKeySchema = z
  .string()
  .trim()
  .min(1, 'Activation key is required');

export const orgIdSchema = z
  .string()
  .trim()
  .min(1, 'Organization ID is required')
  .refine(
    (value) => /^\d+$/.test(value),
    'Organization ID must be numeric only',
  );

// NOTE: this schema has diverging input/output types:
// input -> string
// output -> string[]
// This is because a certificate string could contain
// multiple certificates
export const caCertInputSchema = z
  .string()
  .refine(
    (text) =>
      text.length <= MAX_CERTIFICATE_BYTES &&
      new TextEncoder().encode(text).byteLength <= MAX_CERTIFICATE_BYTES,
    'Certificate must be no larger than 512 KB',
  )
  .trim()
  .transform(decodeCertificateString)
  .superRefine(checkPemBlocks)
  .transform(normalizeCertificates)
  .refine(
    (blocks) => blocks.length > 0,
    'Valid certificate must be present if you are registering Satellite',
  );

export const caCertStateSchema = z
  .array(caCertInputSchema)
  .transform((blocks) => blocks.flat())
  .refine(
    (certs) => certs.length > 0,
    'Valid certificate must be present if you are registering Satellite',
  );

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
  caCerts: caCertStateSchema,
});

export const registrationOptionsSchema = z.object({
  serverUrl: z.string(),
  baseUrl: z.string(),
  activationKey: activationKeySchema,
  orgId: orgIdSchema,
  rhc: z.boolean().default(true),
  insights: z.boolean().default(true),
  proxy: z.string().optional(),
});

export const registrationSliceSchema = z
  .object({
    type: registrationLiterals,
    options: registrationOptionsSchema.optional(),
    satellite: satelliteRegistrationSchema.optional(),
  })
  .superRefine((slice, ctx) => {
    if (slice.type === 'register-now' && !slice.options) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Registration options cannot be empty for register-now types',
      });
    }

    if (slice.type === 'register-satellite' && !slice.satellite) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Satellite options cannot be empty for register-satellite',
      });
    }
  });
