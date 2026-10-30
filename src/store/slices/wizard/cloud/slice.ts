import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { emptyAzureState, emptyGcpState, initialState } from './state';
import { AzureHyperVGeneration, GcpAccountType } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const cloudProvidersSlice = createSlice({
  name: 'wizard/cloudProviders',
  initialState,
  reducers: {
    changeAwsAccountId: (state, action: PayloadAction<string>) => {
      if (state.aws.shareMethod === 'manual') {
        state.aws.accountId = action.payload;
      }
    },
    changeAwsShareMethod: (
      state,
      action: PayloadAction<'manual' | 'onprem' | 'none'>,
    ) => {
      if (action.payload === 'onprem') {
        if (state.aws.shareMethod === 'onprem') return;
        state.aws = { shareMethod: action.payload, region: '' };
        return;
      }

      if (action.payload === 'manual') {
        if (state.aws.shareMethod === 'manual') return;
        state.aws = { shareMethod: action.payload, accountId: '' };
        return;
      }

      state.aws = { shareMethod: action.payload };
    },
    changeAwsSourceId: (state, action: PayloadAction<string>) => {
      if (state.aws.shareMethod === 'sources') {
        state.aws.sourceId = action.payload;
      }
    },
    changeAwsRegion: (state, action: PayloadAction<string>) => {
      if (state.aws.shareMethod === 'onprem') {
        state.aws.region = action.payload;
      }
    },
    reinitializeAws: (state) => {
      state.aws = initialState.aws;
    },
    changeAzureTenantId: (state, action: PayloadAction<string>) => {
      if (!state.azure) {
        state.azure = {
          ...emptyAzureState,
          tenantId: action.payload,
        };
        return;
      }
      state.azure.tenantId = action.payload;
    },
    changeAzureSubscriptionId: (state, action: PayloadAction<string>) => {
      if (!state.azure) {
        state.azure = {
          ...emptyAzureState,
          subscriptionId: action.payload,
        };
        return;
      }
      state.azure.subscriptionId = action.payload;
    },
    changeAzureResourceGroup: (state, action: PayloadAction<string>) => {
      if (!state.azure) {
        state.azure = {
          ...emptyAzureState,
          resourceGroup: action.payload,
        };
        return;
      }
      state.azure.resourceGroup = action.payload;
    },
    changeAzureHyperVGeneration: (
      state,
      action: PayloadAction<AzureHyperVGeneration>,
    ) => {
      if (!state.azure) {
        state.azure = {
          ...emptyAzureState,
          hyperVGeneration: action.payload,
        };
        return;
      }
      state.azure.hyperVGeneration = action.payload;
    },
    initializeAzure: (state) => {
      state.azure = emptyAzureState;
    },
    reinitializeAzure: (state) => {
      state.azure = initialState.azure;
    },
    changeGcpAccountType: (state, action: PayloadAction<GcpAccountType>) => {
      if (state.gcp) {
        state.gcp.accountType = action.payload;
        return;
      }
      if (action.payload === 'domain') {
        state.gcp = { accountType: 'domain', domain: '' };
        return;
      }

      state.gcp = { accountType: action.payload, email: '' };
    },
    changeGcpEmail: (state, action: PayloadAction<string>) => {
      if (state.gcp === undefined || state.gcp.accountType === 'domain') {
        return;
      }

      state.gcp.email = action.payload;
    },
    changeGcpDomain: (state, action: PayloadAction<string>) => {
      if (state.gcp?.accountType !== 'domain') return;
      state.gcp.domain = action.payload;
    },
    changeGcpPrincipal: (state, action: PayloadAction<string>) => {
      if (!state.gcp) return;
      if (state.gcp.accountType === 'domain') {
        state.gcp.domain = action.payload;
        return;
      }
      state.gcp.email = action.payload;
    },
    initializeGcp: (state) => {
      state.gcp = emptyGcpState;
    },
    reinitializeGcp: (state) => {
      state.gcp = initialState.gcp;
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `cloudProviders` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).cloudProviders ??
          initialState,
      );
  },
});

export const {
  changeAwsAccountId,
  changeAwsShareMethod,
  changeAwsSourceId,
  changeAwsRegion,
  reinitializeAws,
  changeAzureTenantId,
  changeAzureSubscriptionId,
  changeAzureResourceGroup,
  changeAzureHyperVGeneration,
  initializeAzure,
  reinitializeAzure,
  changeGcpAccountType,
  changeGcpEmail,
  changeGcpDomain,
  changeGcpPrincipal,
  initializeGcp,
  reinitializeGcp,
} = cloudProvidersSlice.actions;
