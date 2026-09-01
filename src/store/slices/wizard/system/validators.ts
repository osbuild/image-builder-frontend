import { hostnameSchema, kernelSchema, servicesSchema } from './schemas';
import { Kernel, Services } from './types';

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
