import z from 'zod';

import {
  registerNowLiterals,
  registrationLiterals,
  registrationOptionsSchema,
  registrationSliceSchema,
  satelliteRegistrationSchema,
} from './schemas';

export type RegisterNowType = z.infer<typeof registerNowLiterals>;
export type RegistrationType = z.infer<typeof registrationLiterals>;

export type AapRegistration = {
  callbackUrl: string;
  hostConfigKey: string;
  tlsCertificateAuthority?: string | undefined;
  skipTlsVerification?: boolean | undefined;
};

export type SatelliteRegistration = z.input<typeof satelliteRegistrationSchema>;
export type RegistrationOptions = z.infer<typeof registrationOptionsSchema>;

export type RegistrationSlice = z.input<typeof registrationSliceSchema> & {
  aap?: AapRegistration | undefined;
};
