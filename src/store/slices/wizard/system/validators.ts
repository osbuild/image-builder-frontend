import z from 'zod';

import {
  firewallSchema,
  hostnameSchema,
  kernelSchema,
  ntpServersSchema,
  servicesSchema,
  systemSchema,
  timezoneSchema,
  timezoneValueSchema,
} from './schemas';
import { Firewall, Kernel, Services, Timezone } from './types';

import { validateList, validateSchema } from '../validators';

export const validateHostname = (hostname: string) => {
  return validateSchema(hostnameSchema, hostname);
};

export const validateKernelArgs = (items: string[]) => {
  return validateList(kernelSchema.shape.append, items);
};

export const validateKernel = (kernel: Kernel) => {
  return validateSchema(kernelSchema, kernel);
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

export const validateServices = (services: Services) => {
  return validateSchema(servicesSchema, services);
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

export const validateFirewall = (firewall: Firewall) => {
  return validateSchema(firewallSchema, firewall);
};

export const validateTimezoneValue = (timezone?: string) => {
  return validateSchema(timezoneValueSchema, timezone);
};

export const validateNtpServers = (servers?: string[] | undefined) => {
  return validateList(ntpServersSchema, servers);
};

export const validateTimezone = (timezone: Timezone) => {
  return validateSchema(timezoneSchema, timezone);
};

// TODO: change this to the proper type once all the subslice elements
// have been migrated to zod schemas
export const validateSystemSlice = (system: z.infer<typeof systemSchema>) => {
  return validateSchema(systemSchema, system);
};
