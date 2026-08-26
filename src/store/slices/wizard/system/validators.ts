import { hostnameSchema } from './schemas';

import type { ValidationErrors } from '../types';

export const validateHostname = (hostname: string): ValidationErrors => {
  if (!hostname) return {};

  const result = hostnameSchema.safeParse(hostname);
  if (result.success) {
    return {};
  }

  return {
    // NOTE: just return the first issue for now, this
    // is all our frontend currently support
    hostname: result.error.issues[0]?.message ?? 'Invalid hostname',
  };
};
