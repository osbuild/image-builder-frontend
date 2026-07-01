import { SATELLITE_PATH } from '@/constants';
import { Customizations, Distributions } from '@/store/api/backend';

import { initialState } from './state';
import { hasSatelliteCommand, hasSubscription } from './typeguards';
import { RegistrationSlice } from './types';

import { isRhel } from '../output';
import { RequestLike } from '../types';

const parseServerUrl = (
  customizations: Customizations,
): RegistrationSlice['serverUrl'] => {
  if (!hasSubscription(customizations)) {
    return initialState.serverUrl;
  }

  return customizations.subscription['server-url'];
};

const parseBaseUrl = (
  customizations: Customizations,
): RegistrationSlice['baseUrl'] => {
  if (!hasSubscription(customizations)) {
    return initialState.baseUrl;
  }

  return customizations.subscription['base-url'];
};

const parseRegistrationType = (
  customizations: Customizations,
  distribution?: Distributions | undefined,
): RegistrationSlice['type'] => {
  if (hasSatelliteCommand(customizations)) {
    return 'register-satellite';
  }

  if (!isRhel(distribution) || !hasSubscription(customizations)) {
    return 'register-later';
  }

  if (customizations.subscription.rhc) {
    return 'register-now-rhc';
  }

  return 'register-now-insights';
};

const parseActivationKey = (
  customizations: Customizations,
  distribution?: Distributions | undefined,
): RegistrationSlice['activationKey'] => {
  if (!isRhel(distribution) || !hasSubscription(customizations)) {
    return initialState.activationKey;
  }

  return customizations.subscription['activation-key'];
};

const parseOrgId = (
  customizations: Customizations,
  distribution?: Distributions | undefined,
): RegistrationSlice['orgId'] => {
  if (!isRhel(distribution) || !hasSubscription(customizations)) {
    return initialState.orgId;
  }

  return String(customizations.subscription['organization']);
};

const parseSatellite = ({
  files,
  cacerts,
}: Customizations): RegistrationSlice['satelliteRegistration'] => {
  const satelliteFile = files?.find((file) => file.path === SATELLITE_PATH);
  if (!satelliteFile || !satelliteFile.data) {
    return initialState.satelliteRegistration;
  }

  return {
    command: atob(satelliteFile.data),
    caCert: cacerts?.pem_certs[0],
  };
};

const parseAap = ({
  aap_registration,
}: Customizations): RegistrationSlice['aap'] => {
  if (!aap_registration) {
    return initialState.aap;
  }

  return {
    enabled: true,
    callbackUrl: aap_registration.ansible_callback_url,
    hostConfigKey: aap_registration.host_config_key,
    tlsCertificateAuthority: aap_registration.tls_certificate_authority,
    skipTlsVerification: aap_registration.skip_tls_verification,
  };
};

const parseRegistrationRequest = ({
  customizations,
  distribution,
}: RequestLike): RegistrationSlice => ({
  serverUrl: parseServerUrl(customizations),
  baseUrl: parseBaseUrl(customizations),
  type: parseRegistrationType(customizations, distribution),
  activationKey: parseActivationKey(customizations, distribution),
  orgId: parseOrgId(customizations, distribution),
  proxy: customizations.subscription?.insights_client_proxy,
  satelliteRegistration: parseSatellite(customizations),
  aap: parseAap(customizations),
});

const parseRegistrationBlueprint = ({
  customizations,
}: RequestLike): RegistrationSlice => ({
  ...initialState,
  aap: parseAap(customizations),
});

// NOTE: we need a factory method here because the import
// blueprint handles registration slightly differently and
// just sets the defaults even if subscription is set,
// for now, we just left the behaviour as is
// TODO: maybe we should re-consider this, see the
// above note
export const parseRegistrationFromRequest = ({
  customizations,
  distribution,
  ...request
}: RequestLike): RegistrationSlice => {
  if ('id' in request) {
    return parseRegistrationRequest({
      customizations,
      distribution,
      ...request,
    });
  }

  return parseRegistrationBlueprint({
    customizations,
    distribution,
    ...request,
  });
};
