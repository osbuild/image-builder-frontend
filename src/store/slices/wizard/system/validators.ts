import { hostnameSchema } from './schemas';

import type { ValidationResult } from '../types';

export const validateHostname = (hostname: string): ValidationResult => {
  if (!hostname) return [];

  const result = hostnameSchema.safeParse(hostname);
  if (result.success) return [];

  return result.error.issues.map((issue) => ({
    kind: 'format' as const,
    message: issue.message,
    value: hostname,
  }));
};
