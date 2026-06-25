import { createSelector } from '@reduxjs/toolkit';

import type { CustomRepository } from '@/store/api/backend';

import {
  selectCustomRepositories,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectPayloadRepositories,
  selectRecommendedRepositories,
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

    for (const repo in recommendedRepositories) {
      combined.push(convertSchemaToIBCustomRepo(recommendedRepositories[repo]));
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

    for (const repo in recommendedRepositories) {
      combined.push(
        convertSchemaToIBPayloadRepo(recommendedRepositories[repo]),
      );
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
