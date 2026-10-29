import z from 'zod';

export const awsAccountIdSchema = z
  .string()
  .trim()
  .min(1, 'Account ID is required')
  .regex(/^\d+$/, 'Account ID must contain only digits')
  .length(12, 'Account ID must be 12 characters long');

const awsSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  source_type_id: z.string().optional(),
  uid: z.string().optional(),
});

export const awsSchema = z.discriminatedUnion('shareMethod', [
  z.object({
    shareMethod: z.literal('none'),
  }),
  z.object({
    shareMethod: z.literal('manual'),
    accountId: awsAccountIdSchema,
  }),
  z.object({
    shareMethod: z.literal('onprem'),
    region: z.string(),
  }),
  z.object({
    shareMethod: z.literal('sources'),
    source: awsSourceSchema,
    sourceId: z.string(),
  }),
]);

export const cloudSliceSchema = z.object({
  aws: awsSchema,
});
