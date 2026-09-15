import z from 'zod';

import {
  firewallSchema,
  firstbootSchema,
  kernelSchema,
  localeSchema,
  servicesSchema,
  systemSchema,
  timezoneSchema,
} from './schemas';

export type Kernel = z.infer<typeof kernelSchema>;
export type Services = z.infer<typeof servicesSchema>;
export type Firewall = z.infer<typeof firewallSchema>;
export type Timezone = z.infer<typeof timezoneSchema>;
export type Locale = z.infer<typeof localeSchema>;
export type Firstboot = z.infer<typeof firstbootSchema>;

export type SystemSlice = z.infer<typeof systemSchema>;
