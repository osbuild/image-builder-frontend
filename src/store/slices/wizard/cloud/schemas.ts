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
  .min(1, 'Tenant ID is required')
  .pipe(
    z
      .string()
      .length(36, 'Tenant ID must be 36 characters long')
      .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        'Tenant ID must be a valid GUID',
      ),
  );

export const azureSubscriptionIdSchema = z
  .string()
  .min(1, 'Subscription ID is required')
  .pipe(
    z
      .string()
      .length(36, 'Subscription ID must be 36 characters long')
      .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        'Subscription ID must be a valid GUID',
      ),
  );

// TODO: better encapsulate these requirements:
// 'Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period'
export const azureResourceGroupSchema = z
  .string()
  .min(1, 'Resource group is required')
  .pipe(z.string().regex(/^[-\w._()]+[-\w_()]$/));

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
