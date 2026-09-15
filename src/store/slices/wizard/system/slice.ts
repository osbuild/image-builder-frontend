import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialState } from './state';

import { initializeWizard, loadWizardState } from '../actions';

export const systemSlice = createSlice({
  name: 'wizard/system',
  initialState,
  reducers: {
    addLanguage: (state, action: PayloadAction<string>) => {
      if (
        state.locale.languages &&
        !state.locale.languages.some((lang) => lang === action.payload)
      ) {
        state.locale.languages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      if (state.locale.languages) {
        const index = state.locale.languages.findIndex(
          (lang) => lang === action.payload,
        );
        if (index !== -1) {
          state.locale.languages.splice(index, 1);
        }
      }
    },
    replaceLanguage: (
      state,
      action: PayloadAction<{ oldLanguage: string; newLanguage: string }>,
    ) => {
      if (state.locale.languages) {
        const index = state.locale.languages.findIndex(
          (lang) => lang === action.payload.oldLanguage,
        );
        if (index === -1) return;

        const isDuplicate = state.locale.languages.some(
          // ← NEW
          (lang, i) => i !== index && lang === action.payload.newLanguage,
        );
        if (isDuplicate) return; // ← NEW

        state.locale.languages[index] = action.payload.newLanguage;
      }
    },
    clearLanguages: (state) => {
      state.locale.languages = [];
    },
    clearLocale: (state) => {
      state.locale.languages = [];
      state.locale.keyboard = '';
    },
    changeKeyboard: (state, action: PayloadAction<string>) => {
      state.locale.keyboard = action.payload;
    },
    setFirstBootScript: (state, action: PayloadAction<string>) => {
      if (!action.payload) {
        delete state.firstboot.script;
        return;
      }

      state.firstboot.script = action.payload;
    },
    changeEnabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.enabled = action.payload;
    },
    addEnabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.enabled.some((service) => service === action.payload)
      ) {
        state.services.enabled.push(action.payload);
      }
    },
    removeEnabledService: (state, action: PayloadAction<string>) => {
      const index = state.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.enabled.splice(index, 1);
      }
    },
    changeMaskedServices: (state, action: PayloadAction<string[]>) => {
      state.services.masked = action.payload;
    },
    addMaskedService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.masked.some((service) => service === action.payload)
      ) {
        state.services.masked.push(action.payload);
      }
    },
    removeMaskedService: (state, action: PayloadAction<string>) => {
      const index = state.services.masked.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.masked.splice(index, 1);
      }
    },
    changeDisabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.disabled = action.payload;
    },
    addDisabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.disabled.some((service) => service === action.payload)
      ) {
        state.services.disabled.push(action.payload);
      }
    },
    removeDisabledService: (state, action: PayloadAction<string>) => {
      const index = state.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.disabled.splice(index, 1);
      }
    },
    changeKernelName: (state, action: PayloadAction<string>) => {
      state.kernel.name = action.payload;
    },
    addKernelArg: (state, action: PayloadAction<string>) => {
      const existingArgIndex = state.kernel.append.findIndex(
        (arg) => arg === action.payload,
      );

      if (existingArgIndex !== -1) {
        state.kernel.append[existingArgIndex] = action.payload;
      } else {
        state.kernel.append.push(action.payload);
      }
    },
    removeKernelArg: (state, action: PayloadAction<string>) => {
      if (state.kernel.append.length > 0) {
        const index = state.kernel.append.findIndex(
          (arg) => arg === action.payload,
        );
        if (index !== -1) {
          state.kernel.append.splice(index, 1);
        }
      }
    },
    clearKernelAppend: (state) => {
      state.kernel.append = [];
    },
    addEnabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.firewall.services.enabled.push(action.payload);
      }
    },
    removeEnabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.firewall.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.firewall.services.enabled.splice(index, 1);
      }
    },
    addDisabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.firewall.services.disabled.push(action.payload);
      }
    },
    removeDisabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.firewall.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.firewall.services.disabled.splice(index, 1);
      }
    },
    changeTimezone: (state, action: PayloadAction<string>) => {
      state.timezone.timezone = action.payload;
    },
    addNtpServer: (state, action: PayloadAction<string>) => {
      if (
        !state.timezone.ntpservers?.some((server) => server === action.payload)
      ) {
        state.timezone.ntpservers?.push(action.payload);
      }
    },
    removeNtpServer: (state, action: PayloadAction<string>) => {
      if (state.timezone.ntpservers) {
        const index = state.timezone.ntpservers.findIndex(
          (server) => server === action.payload,
        );
        if (index !== -1) {
          state.timezone.ntpservers.splice(index, 1);
        }
      }
    },
    clearTimezone: (state) => {
      state.timezone.timezone = '';
      state.timezone.ntpservers = [];
    },
    changeHostname: (state, action: PayloadAction<string | undefined>) => {
      state.hostname = action.payload;
    },
    addPort: (state, action: PayloadAction<string>) => {
      if (!state.firewall.ports.some((port) => port === action.payload)) {
        state.firewall.ports.push(action.payload);
      }
    },
    removePort: (state, action: PayloadAction<string>) => {
      const index = state.firewall.ports.findIndex(
        (port) => port === action.payload,
      );
      if (index !== -1) {
        state.firewall.ports.splice(index, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `system` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).system ??
          initialState,
      );
  },
});

export const {
  addLanguage,
  removeLanguage,
  replaceLanguage,
  clearLanguages,
  clearLocale,
  changeKeyboard,
  setFirstBootScript,
  changeEnabledServices,
  addEnabledService,
  removeEnabledService,
  changeMaskedServices,
  addMaskedService,
  removeMaskedService,
  changeDisabledServices,
  addDisabledService,
  removeDisabledService,
  changeKernelName,
  addKernelArg,
  removeKernelArg,
  clearKernelAppend,
  addDisabledFirewallService,
  removeDisabledFirewallService,
  addEnabledFirewallService,
  removeEnabledFirewallService,
  changeTimezone,
  addNtpServer,
  removeNtpServer,
  clearTimezone,
  changeHostname,
  addPort,
  removePort,
} = systemSlice.actions;
