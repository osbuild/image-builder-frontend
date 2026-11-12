import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  emptyAapState,
  emptyRegistrationState,
  emptySatelliteState,
  initialState,
} from './state';
import { RegistrationType } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const registrationSlice = createSlice({
  name: 'wizard/registration',
  initialState,
  reducers: {
    changeServerUrl: (state, action: PayloadAction<string>) => {
      if (!state.options) {
        state.options = {
          ...emptyRegistrationState,
          serverUrl: action.payload,
        };
        return;
      }
      state.options.serverUrl = action.payload;
    },
    changeBaseUrl: (state, action: PayloadAction<string>) => {
      if (!state.options) {
        state.options = { ...emptyRegistrationState, baseUrl: action.payload };
        return;
      }
      state.options.baseUrl = action.payload;
    },
    changeProxy: (state, action: PayloadAction<string | undefined>) => {
      if (!state.options) {
        state.options = { ...emptyRegistrationState, proxy: action.payload };
        return;
      }
      state.options.proxy = action.payload;
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
      if (!state.satellite) {
        state.satellite = { ...emptySatelliteState, command: action.payload };
        return;
      }
      state.satellite.command = action.payload;
    },
    changeSatelliteCaCertificate: (state, action: PayloadAction<string>) => {
      if (!state.satellite) {
        state.satellite = { ...emptySatelliteState, caCert: action.payload };
        return;
      }
      state.satellite.caCert = action.payload;
    },
    changeAapEnabled: (state, action: PayloadAction<boolean>) => {
      if (!action.payload) {
        state.aap = undefined;
        return;
      }
      state.aap = emptyAapState;
    },
    changeAapCallbackUrl: (state, action: PayloadAction<string>) => {
      if (!state.aap) {
        state.aap = {
          ...emptyAapState,
          callbackUrl: action.payload,
        };
        return;
      }
      state.aap.callbackUrl = action.payload;
    },
    changeAapHostConfigKey: (state, action: PayloadAction<string>) => {
      if (!state.aap) {
        state.aap = {
          ...emptyAapState,
          hostConfigKey: action.payload,
        };
        return;
      }
      state.aap.hostConfigKey = action.payload;
    },
    changeAapTlsCertificateAuthority: (
      state,
      action: PayloadAction<string>,
    ) => {
      if (!state.aap) {
        state.aap = {
          ...emptyAapState,
          tlsCertificateAuthority: action.payload,
        };
        return;
      }
      state.aap.tlsCertificateAuthority = action.payload;
    },
    changeAapTlsConfirmation: (state, action: PayloadAction<boolean>) => {
      if (!state.aap) {
        state.aap = {
          ...emptyAapState,
          skipTlsVerification: action.payload,
        };
        return;
      }
      state.aap.skipTlsVerification = action.payload;
    },
    changeActivationKey: (state, action: PayloadAction<string>) => {
      if (!state.options) {
        state.options = {
          ...emptyRegistrationState,
          activationKey: action.payload,
        };
        return;
      }
      state.options.activationKey = action.payload;
    },
    changeOrgId: (state, action: PayloadAction<string>) => {
      if (!state.options) {
        state.options = { ...emptyRegistrationState, orgId: action.payload };
        return;
      }
      state.options.orgId = action.payload;
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
