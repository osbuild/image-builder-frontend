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
      if (state.type !== 'register-now') return;
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
      if (state.type !== 'register-now') return;
      if (!state.options) {
        state.options = { ...emptyRegistrationState, baseUrl: action.payload };
        return;
      }
      state.options.baseUrl = action.payload;
    },
    changeRhc: (state, action: PayloadAction<boolean>) => {
      if (!state.options || state.type !== 'register-now') return;
      state.options.rhc = action.payload;

      if (action.payload) {
        // NOTE: insights needs to be enabled for rhc to be enabled
        state.options.insights = action.payload;
      }
    },
    changeInsights: (state, action: PayloadAction<boolean>) => {
      if (!state.options || state.type !== 'register-now') return;
      if (!action.payload) {
        state.options.rhc = action.payload;
      }

      // NOTE: insights needs to be enabled for rhc to be enabled
      state.options.insights = action.payload;
    },
    changeProxy: (state, action: PayloadAction<string | undefined>) => {
      if (state.type !== 'register-now') return;
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
      if (state.type === action.payload) return;
      state.type = action.payload;

      if (action.payload === 'register-later') {
        state.options = undefined;
        state.satellite = undefined;
        return;
      }

      if (action.payload === 'register-satellite') {
        state.options = undefined;
        state.satellite = emptySatelliteState;
        return;
      }

      state.options = emptyRegistrationState;
      state.satellite = undefined;
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
    changeSatelliteCaCertificate: (state, action: PayloadAction<string[]>) => {
      if (!state.satellite) {
        state.satellite = { ...emptySatelliteState, caCerts: action.payload };
        return;
      }
      state.satellite.caCerts = action.payload;
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
      if (state.type !== 'register-now') return;
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
      if (state.type !== 'register-now') return;
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
  changeRhc,
  changeInsights,
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
