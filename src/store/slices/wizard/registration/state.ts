import { RegistrationSlice } from './types';

export const initialState: RegistrationSlice = {
  serverUrl: '',
  baseUrl: '',
  proxy: undefined,
  type: process.env.IS_ON_PREMISE
    ? 'register-now-insights'
    : 'register-now-rhc',
  activationKey: undefined,
  orgId: undefined,
  satelliteRegistration: {
    command: undefined,
    caCert: undefined,
  },
  aap: {
    enabled: false,
    callbackUrl: undefined,
    hostConfigKey: undefined,
    tlsCertificateAuthority: undefined,
    skipTlsVerification: undefined,
  },
};
