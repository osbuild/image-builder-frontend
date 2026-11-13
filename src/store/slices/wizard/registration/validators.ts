import z from 'zod';

import {
  caCertSchema,
  registrationSliceSchema,
  satelliteCommandSchema,
} from './schemas';

import { validateSchema } from '../validators';

export const validateSatelliteCommand = (cmd: string) => {
  const { data, issues } = validateSchema(satelliteCommandSchema, cmd);

  return {
    data,
    errors: issues,
  };
};

export const validateSatelliteCert = (certs?: string | undefined) => {
  const { data, issues } = validateSchema(caCertSchema, certs);

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
