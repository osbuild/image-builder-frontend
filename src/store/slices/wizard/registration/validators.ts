import z from 'zod';

import {
  activationKeySchema,
  caCertInputSchema,
  caCertStateSchema,
  orgIdSchema,
  registrationSliceSchema,
  satelliteCommandSchema,
} from './schemas';

import { ValidationResult } from '../types';
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

export const validateSatelliteCommand = (cmd: string) => {
  const { data, issues } = validateSchema(satelliteCommandSchema, cmd);

  return {
    data,
    errors: issues,
  };
};

export const validateSatelliteCert = (
  certs: string,
): ValidationResult<string[]> => {
  const { data, issues } = validateSchema(caCertInputSchema, certs);

  return {
    data,
    errors: issues,
  };
};

export const validateSatelliteCerts = (
  certs: string[],
): ValidationResult<string[]> => {
  const { data, issues } = validateSchema(caCertStateSchema, certs);

  return {
    data,
    errors: issues,
  };
};

export const validateRegistrationSlice = (
  slice: z.output<typeof registrationSliceSchema>,
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
