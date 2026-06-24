import { RegistrationSlice } from './types';

export const initialState: RegistrationSlice = {
  serverUrl: '',
  baseUrl: '',
  proxy: undefined,
  type: 'register-now-rhc',
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
