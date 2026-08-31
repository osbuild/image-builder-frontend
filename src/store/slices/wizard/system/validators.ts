import { hostnameSchema } from './schemas';

import { validateSchema } from '../validators';

export const validateHostname = (hostname: string) => {
  return validateSchema(hostnameSchema, hostname);
};
