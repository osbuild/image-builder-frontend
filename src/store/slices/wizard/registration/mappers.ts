import { createSelector } from '@reduxjs/toolkit';

import {
  SATELLITE_PATH,
  SATELLITE_SERVICE_DATA,
  SATELLITE_SERVICE_PATH,
} from '@/constants';
import type { File } from '@/store/api/backend';

import {
  selectAapCallbackUrl,
  selectAapEnabled,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
  selectActivationKey,
  selectBaseUrl,
  selectOrgId,
  selectProxy,
  selectRegistrationType,
  selectSatelliteCaCertificate,
  selectSatelliteRegistrationCommand,
  selectServerUrl,
} from './selectors';

const mapSubscription = createSelector(
  [
    selectRegistrationType,
    selectActivationKey,
    selectOrgId,
    selectServerUrl,
    selectBaseUrl,
    selectProxy,
  ],
  (registrationType, activationKey, orgId, serverUrl, baseUrl, proxy) => {
    if (
      registrationType === 'register-later' ||
      registrationType === 'register-satellite'
    ) {
      return undefined;
    }

    // this is existing behaviour, but maybe we should return
    // undefined instead, since this is a bit of an anti-pattern
    if (activationKey === undefined) {
      throw new Error(
        'Activation key unexpectedly undefined while generating subscription customization',
      );
    }

    if (!orgId || isNaN(Number(orgId))) {
      return undefined;
    }

    const subscription = {
      'activation-key': activationKey,
      organization: Number(orgId),
      'server-url': serverUrl,
      'base-url': baseUrl,
      insights_client_proxy: proxy,
      insights: false,
      rhc: false,
    };

    if (registrationType === 'register-now') {
      return { subscription };
    }

    if (registrationType === 'register-now-insights') {
      return {
        subscription: { ...subscription, insights: true },
      };
    }

    if (registrationType === 'register-now-rhc') {
      return {
        subscription: { ...subscription, insights: true, rhc: true },
      };
    }

    return undefined;
  },
);

const mapAap = createSelector(
  [
    selectAapEnabled,
    selectAapCallbackUrl,
    selectAapHostConfigKey,
    selectAapTlsCertificateAuthority,
    selectAapTlsConfirmation,
  ],
  (
    enabled,
    callbackUrl,
    hostConfigKey,
    tlsCertificateAuthority,
    skipTlsVerification,
  ) => {
    if (!enabled) {
      return undefined;
    }

    if (!callbackUrl && !hostConfigKey && !tlsCertificateAuthority) {
      return undefined;
    }

    return {
      aap_registration: {
        ansible_callback_url: callbackUrl || '',
        host_config_key: hostConfigKey || '',
        tls_certificate_authority: tlsCertificateAuthority || undefined,
        skip_tls_verification: skipTlsVerification || undefined,
      },
    };
  },
);

const mapCaCerts = createSelector(
  [selectRegistrationType, selectSatelliteCaCertificate],
  (registrationType, cacert) => {
    if (registrationType !== 'register-satellite') {
      return undefined;
    }

    if (!cacert) {
      return undefined;
    }

    return {
      cacerts: {
        pem_certs: [cacert],
      },
    };
  },
);

// this needs to be exported because other slices
// also have file customizations
export const mapSatelliteFiles = createSelector(
  [selectSatelliteRegistrationCommand, selectRegistrationType],
  (satCmd, registrationType): File[] => {
    if (!satCmd || registrationType !== 'register-satellite') {
      return [];
    }

    // TODO: we really should figure out how to handle this
    // lower down in the stack rather than the frontend
    return [
      {
        path: SATELLITE_SERVICE_PATH,
        data: SATELLITE_SERVICE_DATA,
        data_encoding: 'base64',
        ensure_parents: true,
      },
      {
        path: SATELLITE_PATH,
        data: btoa(satCmd),
        mode: '0774',
        data_encoding: 'base64',
        ensure_parents: true,
      },
    ];
  },
);

export const mapRegistrationCustomizations = createSelector(
  [mapSubscription, mapCaCerts, mapAap],
  (subscription, cacerts, aap) => ({ ...subscription, ...cacerts, ...aap }),
);
