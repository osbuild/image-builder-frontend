import { ContentOrigin } from '@/constants';
import { CustomRepository, Repository } from '@/store/api/backend';
import {
  ApiRepositoryParameterResponse,
  ApiRepositoryResponse,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';
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
