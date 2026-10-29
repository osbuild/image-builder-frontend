import z from 'zod';

export const awsAccountIdSchema = z
  .string()
  .trim()
  .refine((value) => value.length > 0, {
    error: 'Account ID is required',
    abort: true,
  })
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
    region: z.string().trim().min(1, 'Region is required'),
  }),
  z.object({
    shareMethod: z.literal('sources'),
    source: awsSourceSchema,
    sourceId: z.string(),
  }),
]);

export const azureTenantIdSchema = z
  .string()
  .refine((value) => value.length > 0, {
    error: 'Tenant ID is required',
    abort: true,
  })
  .length(36, 'Tenant ID must be 36 characters long')
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Tenant ID must be a valid GUID',
  );

export const azureSubscriptionIdSchema = z
  .string()
  .refine((value) => value.length > 0, {
    error: 'Subscription ID is required',
    abort: true,
  })
  .length(36, 'Subscription ID must be 36 characters long')
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Subscription ID must be a valid GUID',
  );

export const azureResourceGroupSchema = z
  .string()
  .refine((value) => value.length > 0, {
    error: 'Resource group is required',
    abort: true,
  })
  .max(90, 'Resource group must be 90 characters or fewer')
  .regex(/^[A-Za-z0-9_().-]*$/, 'Resource group contains invalid characters')
  .refine(
    (group) => !group.endsWith('.'),
    'Resource group cannot end in a period',
  );

export const azureSchema = z.object({
  tenantId: azureTenantIdSchema.optional(),
  subscriptionId: azureSubscriptionIdSchema.optional(),
  resourceGroup: azureResourceGroupSchema.optional(),
  hyperVGeneration: z.literal(['V1', 'V2']).default('V2'),
});

export const cloudSliceSchema = z.object({
  aws: awsSchema,
  azure: azureSchema,
});
