import { ActivationKeys } from '@/store/api/rhsm';

import { REGISTER_NOW_TYPES } from './constants';

export type RegisterNowType = (typeof REGISTER_NOW_TYPES)[number];

export type RegistrationType =
  | 'register-later'
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc'
  | 'register-satellite'
  | 'register-aap';

export type RegistrationSlice = {
  serverUrl: string;
  baseUrl: string;
  proxy: string | undefined;
  type: RegistrationType;
  activationKey: ActivationKeys['name'];
  orgId: string | undefined;
  satelliteRegistration: {
    command: string | undefined;
    caCert: string | undefined;
  };
  aap: {
    enabled: boolean;
    callbackUrl: string | undefined;
    hostConfigKey: string | undefined;
    tlsCertificateAuthority: string | undefined;
    skipTlsVerification: boolean | undefined;
  };
};
