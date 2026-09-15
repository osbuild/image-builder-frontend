import z from 'zod';

import {
  firewallSchema,
  hostnameSchema,
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
import { Firewall, Kernel, Locale, Services, Timezone } from './types';

import type { ValidationResult } from '../types';
import { validateList, validateSchema } from '../validators';

export const validateHostname = (hostname: string): ValidationResult => ({
  errors: validateSchema(hostnameSchema, hostname),
});

export const validateKernelArgs = (items: string[]): ValidationResult => ({
  errors: validateList(kernelSchema.shape.append, items),
});

export const validateKernel = (kernel: Kernel): ValidationResult => ({
  errors: validateSchema(kernelSchema, kernel),
});

export const validateEnabledServices = (items: string[]): ValidationResult => ({
  errors: validateList(servicesSchema.shape.enabled, items),
});

export const validateDisabledServices = (
  items: string[],
): ValidationResult => ({
  errors: validateList(servicesSchema.shape.disabled, items),
});

export const validateMaskedServices = (items: string[]): ValidationResult => ({
  errors: validateList(servicesSchema.shape.masked, items),
});

export const validateServices = (services: Services): ValidationResult => ({
  errors: validateSchema(servicesSchema, services),
});

export const validateFirewallPorts = (items: string[]): ValidationResult => ({
  errors: validateList(firewallSchema.shape.ports, items),
});

export const validateFirewallEnabledServices = (
  items: string[],
): ValidationResult => ({
  errors: validateList(firewallSchema.shape.services.shape.enabled, items),
});

export const validateFirewallDisabledServices = (
  items: string[],
): ValidationResult => ({
  errors: validateList(firewallSchema.shape.services.shape.disabled, items),
});

export const validateFirewall = (firewall: Firewall): ValidationResult => ({
  errors: validateSchema(firewallSchema, firewall),
});

export const validateTimezoneValue = (timezone?: string): ValidationResult => ({
  errors: validateSchema(timezoneValueSchema, timezone),
});

export const validateNtpServers = (
  servers?: string[] | undefined,
): ValidationResult => ({ errors: validateList(ntpServersSchema, servers) });

export const validateTimezone = (timezone: Timezone): ValidationResult => ({
  errors: validateSchema(timezoneSchema, timezone),
});

export const validateLanguages = (
  languages?: string[] | undefined,
): ValidationResult => ({
  errors: validateList(languageListSchema, languages),
});

export const validateKeyboard = (
  keyboard?: string | undefined,
): ValidationResult => ({ errors: validateSchema(keyboardSchema, keyboard) });

export const validateLocale = (locale: Locale): ValidationResult => ({
  errors: validateSchema(localeSchema, locale),
});

export const validateScript = (
  script?: string | undefined,
): ValidationResult => ({
  errors: validateSchema(scriptSchema, script),
});

// TODO: change this to the proper type once all the subslice elements
// have been migrated to zod schemas
export const validateSystemSlice = (
  system: z.infer<typeof systemSchema>,
): ValidationResult => {
  return { errors: validateSchema(systemSchema, system) };
};
