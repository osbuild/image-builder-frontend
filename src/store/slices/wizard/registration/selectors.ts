import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

export const selectServerUrl = (state: RootState) => {
  return state.wizard.registration.options?.serverUrl;
};

export const selectBaseUrl = (state: RootState) => {
  return state.wizard.registration.options?.baseUrl;
};

export const selectProxy = (state: RootState) => {
  return state.wizard.registration.options?.proxy;
};

export const selectRegistrationType = (state: RootState) => {
  return state.wizard.registration.type;
};

export const selectActivationKey = (state: RootState) => {
  return state.wizard.registration.options?.activationKey;
};

export const selectOrgId = (state: RootState) => {
  return state.wizard.registration.options?.orgId;
};

export const selectSatelliteRegistrationCommand = (state: RootState) => {
  return state.wizard.registration.satellite?.command;
};

export const selectSatelliteCaCertificate = (state: RootState) => {
  return state.wizard.registration.satellite?.caCert;
};

export const selectAapRegistration = (state: RootState) => {
  return state.wizard.registration.aap;
};

export const selectAapEnabled = (state: RootState) => {
  return state.wizard.registration.aap !== undefined;
};

export const selectAapCallbackUrl = (state: RootState) => {
  return state.wizard.registration.aap?.callbackUrl;
};

export const selectAapHostConfigKey = (state: RootState) => {
  return state.wizard.registration.aap?.hostConfigKey;
};

export const selectAapTlsCertificateAuthority = (state: RootState) => {
  return state.wizard.registration.aap?.tlsCertificateAuthority;
};

export const selectAapTlsConfirmation = (state: RootState) => {
  return state.wizard.registration.aap?.skipTlsVerification;
};

export const selectAapTlsConfigured = createSelector(
  [selectAapTlsCertificateAuthority],
  (certificate) => {
    return !!certificate;
  },
);

export const selectRegistrationSlice = (state: RootState) => {
  return state.wizard.registration;
};
