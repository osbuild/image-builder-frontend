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
