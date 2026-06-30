import { ContentOrigin } from '@/constants';
import { CustomRepository, Repository } from '@/store/api/backend';
import { ApiRepositoryResponseRead } from '@/store/api/contentSources';

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

// Previously DateOnly format of the snapshot date was used (YYYY-MM-DD),
// meaning this is a format that can be present in already existing blueprints.
// Currently used format is RFC3339 (YYYY-MM-DDTHH:MM:SSZ), this condition
// checks which format is getting parsed and converts DateOnly to RFC3339
// when necessary.
export const normalizeSnapshotDate = (raw?: string): string => {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00Z`;
  return '';
};
