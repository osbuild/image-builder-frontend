import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

export const selectServerUrl = (state: RootState) => {
  return state.wizard.registration.serverUrl;
};

export const selectBaseUrl = (state: RootState) => {
  return state.wizard.registration.baseUrl;
};

export const selectProxy = (state: RootState) => {
  return state.wizard.registration.proxy;
};

export const selectRegistrationType = (state: RootState) => {
  return state.wizard.registration.type;
};

export const selectActivationKey = (state: RootState) => {
  return state.wizard.registration.activationKey;
};

export const selectOrgId = (state: RootState) => {
  return state.wizard.registration.orgId;
};

export const selectSatelliteRegistrationCommand = (state: RootState) => {
  return state.wizard.registration.satelliteRegistration.command;
};

export const selectSatelliteCaCertificate = (state: RootState) => {
  return state.wizard.registration.satelliteRegistration.caCert;
};

export const selectAapRegistration = (state: RootState) => {
  return state.wizard.registration.aap;
};

export const selectAapEnabled = (state: RootState) => {
  return state.wizard.registration.aap.enabled;
};

export const selectAapCallbackUrl = (state: RootState) => {
  return state.wizard.registration.aap.callbackUrl;
};

export const selectAapHostConfigKey = (state: RootState) => {
  return state.wizard.registration.aap.hostConfigKey;
};

export const selectAapTlsCertificateAuthority = (state: RootState) => {
  return state.wizard.registration.aap.tlsCertificateAuthority;
};

export const selectAapTlsConfirmation = (state: RootState) => {
  return state.wizard.registration.aap.skipTlsVerification;
};

export const selectAapTlsConfigured = createSelector(
  [selectAapTlsCertificateAuthority],
  (certificate) => {
    return !!certificate;
  },
);
