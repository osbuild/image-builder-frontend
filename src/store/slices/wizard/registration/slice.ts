import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ActivationKeys } from '@/store/api/rhsm';

import { initialState } from './state';
import { RegistrationType } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const registrationSlice = createSlice({
  name: 'wizard/registration',
  initialState,
  reducers: {
    changeServerUrl: (state, action: PayloadAction<string>) => {
      state.serverUrl = action.payload;
    },
    changeBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
    },
    changeProxy: (state, action: PayloadAction<string | undefined>) => {
      state.proxy = action.payload;
    },
    changeRegistrationType: (
      state,
      action: PayloadAction<RegistrationType>,
    ) => {
      state.type = action.payload;
    },
    changeSatelliteRegistrationCommand: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.satelliteRegistration.command = action.payload;
    },
    changeSatelliteCaCertificate: (state, action: PayloadAction<string>) => {
      state.satelliteRegistration.caCert = action.payload;
    },
    changeAapEnabled: (state, action: PayloadAction<boolean>) => {
      state.aap.enabled = action.payload;
    },
    changeAapCallbackUrl: (state, action: PayloadAction<string>) => {
      state.aap.callbackUrl = action.payload;
    },
    changeAapHostConfigKey: (state, action: PayloadAction<string>) => {
      state.aap.hostConfigKey = action.payload;
    },
    changeAapTlsCertificateAuthority: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.aap.tlsCertificateAuthority = action.payload;
    },
    changeAapTlsConfirmation: (state, action: PayloadAction<boolean>) => {
      state.aap.skipTlsVerification = action.payload;
    },
    changeActivationKey: (
      state,
      action: PayloadAction<ActivationKeys['name']>,
    ) => {
      state.activationKey = action.payload;
    },
    changeOrgId: (state, action: PayloadAction<string>) => {
      state.orgId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `registration` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).registration ??
          initialState,
      );
  },
});

export const {
  changeServerUrl,
  changeBaseUrl,
  changeProxy,
  changeRegistrationType,
  changeActivationKey,
  changeOrgId,
  changeSatelliteRegistrationCommand,
  changeSatelliteCaCertificate,
  changeAapEnabled,
  changeAapCallbackUrl,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  changeAapTlsConfirmation,
} = registrationSlice.actions;
