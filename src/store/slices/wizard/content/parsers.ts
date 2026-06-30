import {
  ComposerImageRequest,
  Customizations,
  ImageRequest,
} from '@/store/api/backend';

import { initialState } from './state';
import { ContentSlice, PackageRepository } from './types';
import { normalizeSnapshotDate } from './utilities';

import { RequestLike } from '../types';

const parseRepositories = ({
  custom_repositories,
  payload_repositories,
}: Customizations): ContentSlice['repositories'] => ({
  customRepositories: custom_repositories || [],
  payloadRepositories: payload_repositories || [],
  recommendedRepositories: [],
  redHatRepositories: [],
});

const parsePackages = ({
  packages,
}: Customizations): ContentSlice['packages'] => {
  if (!packages) {
    return initialState.packages;
  }

  return packages
    .filter((pkg) => !pkg.startsWith('@'))
    .filter((pkg) => !/^langpacks-[a-z]+$/.test(pkg))
    .map((pkg) => ({
      name: pkg,
      summary: '',
      repository: '' as PackageRepository,
    }));
};

const parseGroups = ({ packages }: Customizations): ContentSlice['groups'] => {
  if (!packages) {
    return initialState.groups;
  }

  return packages
    .filter((pkg) => pkg.startsWith('@'))
    .map((group) => ({
      name: group.slice(1),
      description: '',
      repository: '' as PackageRepository,
      package_list: [],
    }));
};

const parseLanguagePackages = ({
  packages,
}: Customizations): ContentSlice['verifiedLocaleLangpacks'] => {
  if (!packages) {
    return initialState.verifiedLocaleLangpacks;
  }

  return packages
    .filter((pkg) => !pkg.startsWith('@'))
    .filter((p) => /^langpacks-[a-z]+$/.test(p));
};

const parseEnabledModules = ({
  enabled_modules,
}: Customizations): ContentSlice['enabledModules'] => {
  if (!enabled_modules) {
    return initialState.enabledModules;
  }

  return enabled_modules;
};

const parseSnapshotting = (
  imageRequests: ImageRequest[] | ComposerImageRequest[],
  blueprintSnapshotDate?: string,
): ContentSlice['snapshotting'] => {
  const defaults = initialState.snapshotting;
  if (blueprintSnapshotDate) {
    const snapshotDate = normalizeSnapshotDate(blueprintSnapshotDate);

    return {
      ...defaults,
      useLatest: !snapshotDate,
      snapshotDate,
    };
  }

  if (imageRequests.length === 0) {
    return defaults;
  }

  const snapshotDate = normalizeSnapshotDate(
    imageRequests.find((ir) => ir.snapshot_date)?.snapshot_date,
  );

  const imageRequest = imageRequests[0];
  const template = imageRequest.content_template;
  const templateName = imageRequest.content_template_name;

  return {
    useLatest: !snapshotDate && !template,
    template: template ?? defaults.template,
    templateName: templateName ?? defaults.templateName,
    snapshotDate: snapshotDate,
  };
};

const parseRequestContent = (
  customizations: Customizations,
  imageRequests: ImageRequest[] | ComposerImageRequest[],
): ContentSlice => ({
  repositories: parseRepositories(customizations),
  packages: parsePackages(customizations),
  groups: parseGroups(customizations),
  verifiedLocaleLangpacks: parseLanguagePackages(customizations),
  enabledModules: parseEnabledModules(customizations),
  snapshotting: parseSnapshotting(imageRequests),
});

const parseBlueprintContent = (
  customizations: Customizations,
  imageRequests: ImageRequest[] | ComposerImageRequest[],
  blueprintSnapshotDate?: string,
): ContentSlice => ({
  repositories: parseRepositories(customizations),
  packages: parsePackages(customizations),
  groups: parseGroups(customizations),
  verifiedLocaleLangpacks: parseLanguagePackages(customizations),
  enabledModules: parseEnabledModules(customizations),
  snapshotting: parseSnapshotting(imageRequests, blueprintSnapshotDate),
});

export const parseContentFromRequest = (request: RequestLike): ContentSlice => {
  if ('id' in request) {
    return parseRequestContent(request.customizations, request.image_requests);
  }

  return parseBlueprintContent(
    request.customizations,
    // NOTE: this diverges slightly from the requestMapper, but
    // blueprints don't have image requests, we just added them
    // to satisfy the types
    [],
    request.snapshot_date,
  );
};
