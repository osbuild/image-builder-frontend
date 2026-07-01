import { createSelector } from '@reduxjs/toolkit';

import type { CustomRepository } from '@/store/api/backend';

import {
  selectCustomRepositories,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectPayloadRepositories,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectTemplateName,
  selectUseLatest,
  selectVerifiedLocaleLangpacks,
} from './selectors';
import {
  convertSchemaToIBCustomRepo,
  convertSchemaToIBPayloadRepo,
} from './utilities';

const mapPackages = createSelector(
  [selectPackages, selectPackageGroups, selectVerifiedLocaleLangpacks],
  (packages, groups, langpacks) => {
    const packageNames = new Set(packages.map((pkg) => pkg.name));
    for (const pkg of langpacks) {
      packageNames.add(pkg);
    }

    const list = [...packageNames].concat(groups.map((grp) => '@' + grp.name));

    if (list.length > 0) {
      return { packages: list };
    }

    return undefined;
  },
);

const mapModules = createSelector([selectModules], (modules) => {
  if (modules.length > 0) {
    return { enabled_modules: modules };
  }

  return undefined;
});

const mapCustomRepos = createSelector(
  [selectCustomRepositories, selectRecommendedRepositories],
  (customRepositories, recommendedRepositories) => {
    const cleaned = customRepositories.map((cr) => {
      return {
        ...cr,
        baseurl: cr.baseurl && cr.baseurl.length !== 0 ? cr.baseurl : undefined,
      } as CustomRepository;
    });

    const combined = [...cleaned];

    for (const repo of recommendedRepositories) {
      combined.push(convertSchemaToIBCustomRepo(repo));
    }

    if (combined.length === 0) {
      return undefined;
    }

    return { custom_repositories: combined };
  },
);

const mapPayloadRepos = createSelector(
  [selectPayloadRepositories, selectRecommendedRepositories],
  (payloadRepositories, recommendedRepositories) => {
    const combined = [...payloadRepositories];

    for (const repo of recommendedRepositories) {
      combined.push(convertSchemaToIBPayloadRepo(repo));
    }

    if (combined.length === 0) {
      return undefined;
    }

    return { payload_repositories: combined };
  },
);

export const mapContentCustomizations = createSelector(
  [mapPackages, mapModules, mapCustomRepos, mapPayloadRepos],
  (packages, modules, customRepositories, payloadRepositories) => ({
    ...packages,
    ...modules,
    ...customRepositories,
    ...payloadRepositories,
  }),
);

const mapTemplate = createSelector([selectTemplate], (template) => {
  if (!template) {
    return undefined;
  }

  return {
    content_template: template,
  };
});

const mapTemplateName = createSelector([selectTemplateName], (name) => {
  if (!name) {
    return undefined;
  }

  return {
    content_template_name: name,
  };
});

const mapSnapshotDate = createSelector(
  [selectUseLatest, selectTemplate, selectSnapshotDate],
  (useLatest, template, snapshot) => {
    // Only include snapshot_date when using snapshot mode (not latest or template)
    // Convert empty strings to undefined
    if (useLatest || template || !snapshot) {
      return undefined;
    }

    return {
      snapshot_date: snapshot,
    };
  },
);

export const mapContentImageRequest = createSelector(
  [mapTemplate, mapTemplateName, mapSnapshotDate],
  (template, name, snapshot) => ({
    ...template,
    ...name,
    ...snapshot,
  }),
);
