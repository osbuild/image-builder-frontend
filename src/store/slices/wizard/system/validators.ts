import {
  firewallSchema,
  hostnameInputSchema,
  kernelSchema,
  keyboardSchema,
  languageListSchema,
  localeSchema,
  ntpServersSchema,
  scriptSchema,
  servicesSchema,
  systemSchema,
  timezoneSchema,
  timezoneValueSchema,
} from './schemas';
import {
  Firewall,
  Kernel,
  Locale,
  Services,
  SystemSlice,
  Timezone,
} from './types';

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

export const validateKernel = (kernel: Kernel): ValidationResult<Kernel> => {
  const result = validateSchema(kernelSchema, kernel);

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

export const validateServices = (
  services: Services,
): ValidationResult<Services> => {
  const result = validateSchema(servicesSchema, services);

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

export const validateFirewall = (
  firewall: Firewall,
): ValidationResult<Firewall> => {
  const result = validateSchema(firewallSchema, firewall);

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

export const validateTimezone = (
  timezone: Timezone,
): ValidationResult<Timezone> => {
  const result = validateSchema(timezoneSchema, timezone);

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

export const validateLocale = (locale: Locale): ValidationResult<Locale> => {
  const result = validateSchema(localeSchema, locale);

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
