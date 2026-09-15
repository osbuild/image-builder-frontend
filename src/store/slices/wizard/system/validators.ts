import {
  firewallSchema,
  hostnameInputSchema,
  kernelSchema,
  keyboardSchema,
  languageListSchema,
  ntpServersSchema,
  scriptSchema,
  servicesSchema,
  systemSchema,
  timezoneValueSchema,
} from './schemas';
import type { SystemSlice } from './types';

import type { ValidationResult } from '../types';
import { validateList, validateSchema } from '../validators';

export const validateHostname = (
  hostname: string,
): ValidationResult<string> => {
  const result = validateSchema(hostnameInputSchema, hostname);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateKernelArgs = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(kernelSchema.shape.append, items);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateEnabledServices = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(servicesSchema.shape.enabled, items);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateDisabledServices = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(servicesSchema.shape.disabled, items);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateMaskedServices = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(servicesSchema.shape.masked, items);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateFirewallPorts = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(firewallSchema.shape.ports, items);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateFirewallEnabledServices = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(
    firewallSchema.shape.services.shape.enabled,
    items,
  );

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateFirewallDisabledServices = (
  items: string[],
): ValidationResult<string[]> => {
  const result = validateList(
    firewallSchema.shape.services.shape.disabled,
    items,
  );

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateTimezoneValue = (
  timezone?: string,
): ValidationResult<string> => {
  const result = validateSchema(timezoneValueSchema, timezone);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateNtpServers = (
  servers?: string[] | undefined,
): ValidationResult<string[]> => {
  const result = validateList(ntpServersSchema, servers);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateLanguages = (
  languages?: string[] | undefined,
): ValidationResult<string[]> => {
  const result = validateList(languageListSchema, languages);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateKeyboard = (
  keyboard?: string | undefined,
): ValidationResult<string> => {
  const result = validateSchema(keyboardSchema, keyboard);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateScript = (
  script?: string | undefined,
): ValidationResult<string> => {
  const result = validateSchema(scriptSchema, script);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateSystemSlice = (
  system: SystemSlice,
): ValidationResult<SystemSlice> => {
  const result = validateSchema(systemSchema, system);

  return {
    data: result.data,
    errors: result.issues,
  };
};
