import z from 'zod';

import {
  registrationLiterals,
  registrationOptionsSchema,
  registrationSliceSchema,
  satelliteRegistrationSchema,
} from './schemas';

export type RegistrationType = z.infer<typeof registrationLiterals>;

export type AapRegistration = {
  callbackUrl: string;
  hostConfigKey: string;
  tlsCertificateAuthority?: string | undefined;
  skipTlsVerification?: boolean | undefined;
};

export type SatelliteRegistration = z.output<
  typeof satelliteRegistrationSchema
>;

export type RegistrationOptions = z.infer<typeof registrationOptionsSchema>;

export type RegistrationSlice = z.output<typeof registrationSliceSchema> & {
  aap?: AapRegistration | undefined;
};
