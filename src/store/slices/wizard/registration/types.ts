import z from 'zod';

import {
  registrationLiterals,
  registrationOptionsSchema,
  registrationSliceSchema,
} from './schemas';

export type RegistrationType = z.infer<typeof registrationLiterals>;

export type AapRegistration = {
  callbackUrl: string;
  hostConfigKey: string;
  tlsCertificateAuthority?: string | undefined;
  skipTlsVerification?: boolean | undefined;
};

export type SatelliteRegistration = {
  command: string;
  caCerts: string[];
};

export type RegistrationOptions = z.infer<typeof registrationOptionsSchema>;

export type RegistrationSlice = z.input<typeof registrationSliceSchema> & {
  satellite?: SatelliteRegistration | undefined;
  aap?: AapRegistration | undefined;
};
