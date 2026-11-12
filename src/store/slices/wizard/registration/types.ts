export type RegistrationType =
  'register-later' | 'register-now' | 'register-satellite' | 'register-aap';

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
  activationKey: string;
  orgId: string;
  rhc: boolean;
  insights: boolean;
  proxy?: string | undefined;
};

export type RegistrationSlice = {
  type: RegistrationType;
  options?: RegistrationOptions | undefined;
  satellite?: SatelliteRegistration | undefined;
  aap?: AapRegistration | undefined;
};
