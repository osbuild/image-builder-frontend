import z from 'zod';

export const registerNowLiterals = z.literal([
  'register-now',
  'register-now-insights',
  'register-now-rhc',
]);

export const registrationLiterals = z.union([
  registerNowLiterals,
  z.literal(['register-later', 'register-satellite', 'register-aap']),
]);

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
});
