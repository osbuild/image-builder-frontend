import { SATELLITE_PATH } from '@/constants';
import { Customizations, Distributions } from '@/store/api/backend';

import { initialState } from './state';
import { hasSatelliteCommand, hasSubscription } from './typeguards';
import { RegistrationSlice } from './types';

import { isRhel } from '../output';
import { RequestLike } from '../types';

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

  return 'register-now';
};

const parseRegistrationOptions = (
  customizations: Customizations,
  distribution?: Distributions | undefined,
) => {
  if (!isRhel(distribution) || !hasSubscription(customizations)) {
    return undefined;
  }

  return {
    activationKey: customizations.subscription['activation-key'],
    serverUrl: customizations.subscription['server-url'],
    baseUrl: customizations.subscription['base-url'],
    orgId: String(customizations.subscription['organization']),
    proxy: customizations.subscription['insights_client_proxy'],
    insights: customizations.subscription['insights'] || false,
    rhc:
      (customizations.subscription['rhc'] && !process.env.IS_ON_PREMISE) ||
      false,
  };
};

const parseSatellite = ({
  files,
  cacerts,
}: Customizations): RegistrationSlice['satellite'] => {
  const satelliteFile = files?.find((file) => file.path === SATELLITE_PATH);
  if (!satelliteFile || !satelliteFile.data) {
    return undefined;
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
    return undefined;
  }

  return {
    callbackUrl: aap_registration.ansible_callback_url,
    hostConfigKey: aap_registration.host_config_key,
    tlsCertificateAuthority: aap_registration.tls_certificate_authority,
    skipTlsVerification: aap_registration.skip_tls_verification,
  };
};

const parseRegistrationRequest = ({
  customizations,
  distribution,
}: RequestLike): RegistrationSlice => {
  const defaultOptions = {
    type: parseRegistrationType(customizations, distribution),
    aap: parseAap(customizations),
  };

  if (defaultOptions.type === 'register-later') return defaultOptions;

  if (defaultOptions.type === 'register-satellite') {
    return { ...defaultOptions, satellite: parseSatellite(customizations) };
  }

  return {
    ...defaultOptions,
    options: parseRegistrationOptions(customizations, distribution),
  };
};

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
