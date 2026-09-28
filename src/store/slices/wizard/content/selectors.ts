import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

export const selectUseLatest = (state: RootState) => {
  return state.wizard.content.snapshotting.useLatest;
};

export const selectSnapshotDate = (state: RootState) => {
  return state.wizard.content.snapshotting.snapshotDate;
};

export const selectTemplate = (state: RootState) => {
  return state.wizard.content.snapshotting.template;
};

export const selectTemplateName = (state: RootState) => {
  return state.wizard.content.snapshotting.templateName;
};

export const selectCustomRepositories = (state: RootState) => {
  return state.wizard.content.repositories.customRepositories;
};

export const selectPayloadRepositories = (state: RootState) => {
  return state.wizard.content.repositories.payloadRepositories;
};

export const selectRecommendedRepositories = createSelector(
  [(state: RootState) => state.wizard.content.repositories.customRepositories],
  (custom) => custom.filter((r) => r.isRecommended),
);

export const selectRedHatRepositories = (state: RootState) => {
  return state.wizard.content.repositories.redHatRepositories;
};

export const selectPackages = (state: RootState) => {
  return state.wizard.content.packages;
};

export const selectModules = (state: RootState) => {
  return state.wizard.content.enabledModules;
};

export const selectPackageGroups = (state: RootState) => {
  return state.wizard.content.groups;
};

export const selectVerifiedLocaleLangpacks = (state: RootState) => {
  return state.wizard.content.verifiedLocaleLangpacks;
};

export const selectAllRepositoryIds = createSelector(
  [selectCustomRepositories, selectPayloadRepositories],
  (custom, payload) =>
    Array.from(
      new Set([
        ...custom.map(({ id }) => id),
        ...payload.flatMap(({ id }) => (id ? [id] : [])),
      ]),
    ),
);
