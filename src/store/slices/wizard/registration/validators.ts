import z from 'zod';

import {
  activationKeySchema,
  orgIdSchema,
  registrationSliceSchema,
} from './schemas';

import { validateSchema } from '../validators';

export const validateActivationKey = (key: string) => {
  const { data, issues } = validateSchema(activationKeySchema, key);

  return {
    data,
    errors: issues,
  };
};

export const validateOrgId = (key: string) => {
  const { data, issues } = validateSchema(orgIdSchema, key);

  return {
    data,
    errors: issues,
  };
};

export const validateRegistrationSlice = (
  slice: z.input<typeof registrationSliceSchema>,
  shouldHide: boolean = false,
) => {
  if (shouldHide) {
    return {
      errors: [],
    };
  }

  const { data, issues } = validateSchema(registrationSliceSchema, slice);

  return {
    data,
    errors: issues,
  };
};
