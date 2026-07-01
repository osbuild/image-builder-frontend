import { CustomRepository } from '@/store/api/backend';
import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';

export function mapToCustomRepositories(
  repo: ApiRepositoryImportResponseRead | ApiRepositoryResponseRead,
): CustomRepository[] {
  if (!repo.uuid) return [];
  return [
    {
      id: repo.uuid,
      name: repo.name,
      baseurl: repo.url ? [repo.url] : undefined,
      gpgkey: repo.gpg_key ? [repo.gpg_key] : undefined,
      check_gpg: repo.metadata_verification ?? undefined,
      check_repo_gpg: repo.metadata_verification ?? undefined,
      module_hotfixes: repo.module_hotfixes ?? undefined,
      enabled: true,
    },
  ];
}
