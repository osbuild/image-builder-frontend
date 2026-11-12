import { REGISTER_NOW_TYPES } from './constants';

export type RegisterNowType = (typeof REGISTER_NOW_TYPES)[number];

export type RegistrationType =
  | 'register-later'
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc'
  | 'register-satellite'
  | 'register-aap';

export type AapRegistration = {
  callbackUrl: string;
  hostConfigKey: string;
  tlsCertificateAuthority?: string | undefined;
  skipTlsVerification?: boolean | undefined;
};

export type SatelliteRegistration = {
  command: string;
  caCert?: string | undefined;
};

export type RegistrationOptions = {
  serverUrl: string;
  baseUrl: string;
  proxy?: string | undefined;
  activationKey?: string | undefined;
  orgId?: string | undefined;
};

export type RegistrationSlice = {
  type: RegistrationType;
  options?: RegistrationOptions | undefined;
  satellite?: SatelliteRegistration | undefined;
  aap?: AapRegistration | undefined;
};
