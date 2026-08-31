import { hostnameSchema, kernelSchema } from './schemas';
import { Kernel } from './types';

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
