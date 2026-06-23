import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialState } from './state';
import { AwsShareMethod, AzureHyperVGeneration, GcpAccountType } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const cloudProvidersSlice = createSlice({
  name: 'wizard/cloudProviders',
  initialState,
  reducers: {
    changeAwsAccountId: (state, action: PayloadAction<string>) => {
      state.aws.accountId = action.payload;
    },
    changeAwsShareMethod: (state, action: PayloadAction<AwsShareMethod>) => {
      state.aws.shareMethod = action.payload;
    },
    changeAwsSourceId: (state, action: PayloadAction<string | undefined>) => {
      state.aws.sourceId = action.payload;
    },
    changeAwsRegion: (state, action: PayloadAction<string | undefined>) => {
      state.aws.region = action.payload;
    },
    reinitializeAws: (state) => {
      state.aws.accountId = '';
      state.aws.shareMethod = 'manual';
      state.aws.source = undefined;
      state.aws.region = 'us-east-1';
    },
    changeAzureTenantId: (state, action: PayloadAction<string>) => {
      state.azure.tenantId = action.payload;
    },
    changeAzureSubscriptionId: (state, action: PayloadAction<string>) => {
      state.azure.subscriptionId = action.payload;
    },
    changeAzureResourceGroup: (state, action: PayloadAction<string>) => {
      state.azure.resourceGroup = action.payload;
    },
    changeAzureHyperVGeneration: (
      state,
      action: PayloadAction<AzureHyperVGeneration>,
    ) => {
      state.azure.hyperVGeneration = action.payload;
    },
    reinitializeAzure: (state) => {
      state.azure.tenantId = undefined;
      state.azure.subscriptionId = undefined;
      state.azure.resourceGroup = undefined;
    },
    changeGcpAccountType: (state, action: PayloadAction<GcpAccountType>) => {
      state.gcp.accountType = action.payload;
    },
    changeGcpEmail: (state, action: PayloadAction<string>) => {
      state.gcp.email = action.payload;
    },
    reinitializeGcp: (state) => {
      state.gcp.accountType = 'user';
      state.gcp.email = '';
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
  reinitializeAzure,
  changeGcpAccountType,
  changeGcpEmail,
  reinitializeGcp,
} = cloudProvidersSlice.actions;
