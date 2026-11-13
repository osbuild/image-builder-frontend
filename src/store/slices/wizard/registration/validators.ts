import z from 'zod';

import { registrationSliceSchema } from './schemas';

import { validateSchema } from '../validators';

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
