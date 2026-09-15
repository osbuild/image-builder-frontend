import {
  firewallSchema,
  hostnameSchema,
  kernelSchema,
  keyboardSchema,
  languageListSchema,
  ntpServersSchema,
  scriptSchema,
  servicesSchema,
  systemSchema,
  timezoneValueSchema,
} from './schemas';
import { SystemSlice } from './types';

import { validateList, validateSchema } from '../validators';

export const validateHostname = (hostname: string) => {
  return validateSchema(hostnameSchema, hostname);
};

export const validateKernelArgs = (items: string[]) => {
  return validateList(kernelSchema.shape.append, items);
};

export const validateEnabledServices = (items: string[]) => {
  return validateList(servicesSchema.shape.enabled, items);
};

export const validateDisabledServices = (items: string[]) => {
  return validateList(servicesSchema.shape.disabled, items);
};

export const validateMaskedServices = (items: string[]) => {
  return validateList(servicesSchema.shape.masked, items);
};

export const validateFirewallPorts = (items: string[]) => {
  return validateList(firewallSchema.shape.ports, items);
};

export const validateFirewallEnabledServices = (items: string[]) => {
  return validateList(firewallSchema.shape.services.shape.enabled, items);
};

export const validateFirewallDisabledServices = (items: string[]) => {
  return validateList(firewallSchema.shape.services.shape.disabled, items);
};

export const validateTimezoneValue = (timezone?: string) => {
  return validateSchema(timezoneValueSchema, timezone);
};

export const validateNtpServers = (servers?: string[] | undefined) => {
  return validateList(ntpServersSchema, servers);
};

export const validateLanguages = (languages?: string[] | undefined) => {
  return validateList(languageListSchema, languages);
};

export const validateKeyboard = (keyboard?: string | undefined) => {
  return validateSchema(keyboardSchema, keyboard);
};

export const validateScript = (script?: string | undefined) => {
  return validateSchema(scriptSchema, script);
};

export const validateSystemSlice = (system: SystemSlice) => {
  return validateSchema(systemSchema, system);
};
