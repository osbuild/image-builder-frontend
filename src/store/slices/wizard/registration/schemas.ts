import z from 'zod';

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
  })
  .superRefine((slice, ctx) => {
    if (slice.type === 'register-now' && !slice.options) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Registration options cannot be empty for register-now types',
      });
    }
  });
