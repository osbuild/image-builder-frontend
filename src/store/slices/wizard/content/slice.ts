import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CustomRepository, Module, Repository } from '@/store/api/backend';
import { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import { yyyyMMddFormat } from '@/Utilities/time';

import { initialState } from './state';
import { GroupWithRepositoryInfo, IBPackageWithRepositoryInfo } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const contentSlice = createSlice({
  name: 'wizard/content',
  initialState,
  reducers: {
    changeUseLatest: (state, action: PayloadAction<boolean>) => {
      if (!action.payload && state.snapshotting.snapshotDate === '') {
        state.snapshotting.snapshotDate = `${yyyyMMddFormat(new Date())}T00:00:00.000Z`;
      }

      state.snapshotting.useLatest = action.payload;
    },
    changeSnapshotDate: (state, action: PayloadAction<string>) => {
      // Store DatePicker's YYYY-MM-DD format as RFC3339 e.g. "2025-11-26T00:00:00.000Z" in state
      const yyyyMMDDRegex = /^\d{4}-\d{2}-\d{2}$/;
      const date = new Date(action.payload);
      if (yyyyMMDDRegex.test(action.payload) && !isNaN(date.getTime())) {
        state.snapshotting.snapshotDate = date.toISOString();
      } else {
        // For empty strings or already-ISO formatted strings, store as-is
        state.snapshotting.snapshotDate = action.payload;
      }
    },
    changeTemplate: (state, action: PayloadAction<string>) => {
      state.snapshotting.template = action.payload;
    },
    changeTemplateName: (state, action: PayloadAction<string>) => {
      state.snapshotting.templateName = action.payload;
    },
    importCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>,
    ) => {
      state.repositories.customRepositories = [
        ...state.repositories.customRepositories,
        ...action.payload,
      ];
    },
    changeCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>,
    ) => {
      state.repositories.customRepositories = action.payload;
    },
    changePayloadRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories.payloadRepositories = action.payload;
    },
    changeRedHatRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories.redHatRepositories = action.payload;
    },
    addRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>,
    ) => {
      if (
        !state.repositories.recommendedRepositories.some(
          (repo) => repo.url === action.payload.url,
        )
      ) {
        state.repositories.recommendedRepositories.push(action.payload);
      }
    },
    removeRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>,
    ) => {
      state.repositories.recommendedRepositories =
        state.repositories.recommendedRepositories.filter(
          (repo) => repo.url !== action.payload.url,
        );
    },
    addPackage: (state, action: PayloadAction<IBPackageWithRepositoryInfo>) => {
      const existingPackageIndex = state.packages.findIndex(
        (pkg) => pkg.name === action.payload.name,
      );

      if (existingPackageIndex !== -1) {
        state.packages[existingPackageIndex] = action.payload;
      } else {
        state.packages.push(action.payload);
      }
    },
    removePackage: (
      state,
      action: PayloadAction<IBPackageWithRepositoryInfo['name']>,
    ) => {
      const index = state.packages.findIndex(
        (pkg) => pkg.name === action.payload,
      );
      if (index !== -1) {
        state.packages.splice(index, 1);
      }
    },
    addModule: (state, action: PayloadAction<Module>) => {
      const existingModuleIndex = state.enabledModules.findIndex(
        (module) => module.name === action.payload.name,
      );

      if (existingModuleIndex !== -1) {
        state.enabledModules[existingModuleIndex] = action.payload;
      } else {
        state.enabledModules.push(action.payload);
      }
    },
    removeModule: (state, action: PayloadAction<Module['name']>) => {
      const index = state.enabledModules.findIndex(
        (module) => module.name === action.payload,
      );
      // count other packages from the same module
      const pkgCount = state.packages.filter(
        (pkg) => pkg.module_name === action.payload,
      );
      // if the module exists and it's not connected to any packages, remove it
      if (index !== -1 && pkgCount.length < 1) {
        state.enabledModules.splice(index, 1);
      }
    },
    addPackageGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo>,
    ) => {
      const existingGrpIndex = state.groups.findIndex(
        (grp) => grp.name === action.payload.name,
      );

      if (existingGrpIndex !== -1) {
        state.groups[existingGrpIndex] = action.payload;
      } else {
        state.groups.push(action.payload);
      }
    },
    removePackageGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo['name']>,
    ) => {
      const index = state.groups.findIndex(
        (grp) => grp.name === action.payload,
      );
      if (index !== -1) {
        state.groups.splice(index, 1);
      }
    },
    setVerifiedLocaleLangpacks: (state, action: PayloadAction<string[]>) => {
      state.verifiedLocaleLangpacks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `content` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).content ??
          initialState,
      );
  },
});

export const {
  changeUseLatest,
  changeSnapshotDate,
  changeTemplate,
  changeTemplateName,
  changeCustomRepositories,
  importCustomRepositories,
  changePayloadRepositories,
  addRecommendedRepository,
  removeRecommendedRepository,
  addPackage,
  removePackage,
  addModule,
  removeModule,
  addPackageGroup,
  removePackageGroup,
  changeRedHatRepositories,
  setVerifiedLocaleLangpacks,
} = contentSlice.actions;
