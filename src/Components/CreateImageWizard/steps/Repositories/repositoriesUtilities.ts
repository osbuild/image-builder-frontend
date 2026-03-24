import { ContentOrigin } from '@/constants';
import { CustomRepository, Repository } from '@/store/api/backend';
import {
  ApiRepositoryParameterResponse,
  ApiRepositoryResponse,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';
import { requiredRedHatRepos } from '@/Utilities/requiredRedHatRepos';
import {
  convertStringToDate,
  timestampToDisplayString,
} from '@/Utilities/time';

export const convertSchemaToIBCustomRepo = (
  repo: ApiRepositoryResponseRead,
) => {
  const imageBuilderRepo: CustomRepository = {
    id: repo.uuid!,
    name: repo.name,
    baseurl: repo.origin === ContentOrigin.UPLOAD ? undefined : [repo.url!],
    check_gpg: false,
  };
  // only include the flag if enabled
  if (repo.module_hotfixes) {
    imageBuilderRepo.module_hotfixes = repo.module_hotfixes;
  }
  if (repo.gpg_key) {
    imageBuilderRepo.gpgkey = [repo.gpg_key];
    imageBuilderRepo.check_gpg = true;
    imageBuilderRepo.check_repo_gpg = repo.metadata_verification;
  }

  return imageBuilderRepo;
};

export const convertSchemaToIBPayloadRepo = (
  repo: ApiRepositoryResponseRead,
) => {
  const imageBuilderRepo: Repository = {
    id: repo.uuid!,
    baseurl: repo.origin === ContentOrigin.UPLOAD ? undefined : repo.url!,
    rhsm: false,
    check_gpg: false,
  };
  // only include the flag if enabled
  if (repo.module_hotfixes) {
    imageBuilderRepo.module_hotfixes = repo.module_hotfixes;
  }
  if (repo.gpg_key) {
    imageBuilderRepo.gpgkey = repo.gpg_key;
    imageBuilderRepo.check_gpg = true;
    imageBuilderRepo.check_repo_gpg = repo.metadata_verification;
  }

  return imageBuilderRepo;
};

export const getLastIntrospection = (
  repoIntrospections: ApiRepositoryResponse['last_introspection_time'],
) => {
  const currentDate = Date.now();
  const lastIntrospectionDate = convertStringToDate(repoIntrospections);
  const timeDeltaInSeconds = Math.floor(
    (currentDate - lastIntrospectionDate) / 1000,
  );

  if (timeDeltaInSeconds <= 60) {
    return 'A few seconds ago';
  } else if (timeDeltaInSeconds <= 60 * 60) {
    return 'A few minutes ago';
  } else if (timeDeltaInSeconds <= 60 * 60 * 24) {
    return 'A few hours ago';
  } else {
    return timestampToDisplayString(repoIntrospections);
  }
};

export const getReadableArchitecture = (
  technicalArch: string | undefined,
  repositoryParameters: ApiRepositoryParameterResponse | undefined,
) => {
  if (!technicalArch || !repositoryParameters?.distribution_arches) {
    return technicalArch || '-';
  }

  const archParam = repositoryParameters.distribution_arches.find(
    (arch) => arch.label === technicalArch,
  );

  return archParam?.name || technicalArch;
};

export const getReadableVersions = (
  technicalVersions: string[] | undefined,
  repositoryParameters: ApiRepositoryParameterResponse | undefined,
) => {
  if (!technicalVersions || !repositoryParameters?.distribution_versions) {
    return technicalVersions || '-';
  }

  const readableVersions = technicalVersions.map((version) => {
    const versionParam = repositoryParameters.distribution_versions?.find(
      (v) => v.label === version,
    );
    return versionParam?.name || version;
  });

  return readableVersions.join(', ');
};

export const isEPELUrl = (repoUrl: string) => {
  const epelUrls = [
    'https://dl.fedoraproject.org/pub/epel/10/Everything/x86_64/',
    'https://dl.fedoraproject.org/pub/epel/9/Everything/x86_64/',
    'https://dl.fedoraproject.org/pub/epel/8/Everything/x86_64/',
  ];

  return epelUrls.includes(repoUrl);
};

export const isBaseOSOrAppStream = (
  repoUrl: string,
  arch: string,
  version: string,
) => {
  const requiredUrls = requiredRedHatRepos(arch, version);
  if (!requiredUrls) return false;
  return requiredUrls.includes(repoUrl);
};

export const isRepoDisabled = (
  repo: ApiRepositoryResponseRead,
  isSelected: boolean,
  isFetching: boolean,
  contentList: ApiRepositoryResponseRead[],
  selected: Set<string>,
  recommendedRepos: ApiRepositoryResponseRead[],
  packages: { name: string; summary: string }[],
  groups: { name: string; description: string; package_list?: string[] }[],
  useLatestContent: boolean,
  arch: string,
  version: string,
): [boolean, string] => {
  if (isFetching) {
    return [true, 'Repository data is still fetching, please wait.'];
  }

  if (
    !isSelected &&
    isEPELUrl(repo.url!) &&
    repo.origin === ContentOrigin.EXTERNAL
  ) {
    return [
      true,
      'Custom EPEL repositories are going to be removed soon.\n' +
        'Please use the "Community" EPEL repositories instead.',
    ];
  }

  const hasSelectedEPEL = contentList.some(
    (r) => r.uuid !== repo.uuid && isEPELUrl(r.url!) && selected.has(r.uuid!),
  );

  if (isEPELUrl(repo.url!) && !isSelected && hasSelectedEPEL) {
    return [true, 'Only one EPEL repository can be selected at a time.'];
  }

  if (
    recommendedRepos.length > 0 &&
    repo.url?.includes('epel') &&
    isSelected &&
    (packages.length || groups.length)
  ) {
    return [
      true,
      'This repository was added because of previously recommended packages added to the image.\n' +
        'To remove the repository, its related packages must be removed first.',
    ];
  }

  if (repo.status === 'Invalid' || repo.status === 'Unavailable') {
    return [
      true,
      `Repository can't be selected. The status is still '${repo.status}'.`,
    ];
  }
  if (!repo.last_introspection_time) {
    return [
      true,
      `Repository can't be selected, we are still learning about it.`,
    ];
  }

  if (!repo.snapshot && !isSelected && !useLatestContent) {
    return [
      true,
      `This repository doesn't have snapshots enabled, so it cannot be selected.`,
    ];
  }

  if (isBaseOSOrAppStream(repo.url!, arch, version)) {
    return [
      true,
      'This repository is pre-selected for the chosen architecture and OS version.',
    ];
  }

  return [false, ''];
};
