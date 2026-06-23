import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';

export const existingRepo: ApiRepositoryResponseRead = {
  uuid: 'existing-uuid-1',
  name: 'existing-repo',
  url: 'http://existing.repo.example.com/x86_64/',
  distribution_versions: ['9'],
  distribution_arch: 'x86_64',
  status: 'Valid',
  gpg_key: '',
  metadata_verification: false,
  module_hotfixes: false,
};

export const anotherExistingRepo: ApiRepositoryResponseRead = {
  uuid: 'existing-uuid-2',
  name: 'another-existing-repo',
  url: 'http://another-existing.repo.example.com/x86_64/',
  distribution_versions: ['9'],
  distribution_arch: 'x86_64',
  status: 'Valid',
  gpg_key: '',
  metadata_verification: false,
  module_hotfixes: false,
};

export const newRepoUrl = 'http://brand-new.repo.example.com/x86_64/';

export const importedNewRepo = {
  uuid: 'new-uuid-1',
  url: newRepoUrl,
  name: 'brand-new-repo',
  warnings: [],
};

export const createBlueprintJson = (
  contentSources: { url: string; name?: string }[],
) =>
  JSON.stringify({
    name: 'test-blueprint',
    description: 'Test blueprint',
    distribution: 'rhel-9',
    customizations: {
      packages: [],
    },
    image_requests: [
      {
        architecture: 'x86_64',
        image_type: 'guest-image',
        upload_request: { type: 'aws.s3', options: {} },
      },
    ],
    content_sources: contentSources.map((cs) => ({
      url: cs.url,
      name: cs.name ?? cs.url,
    })),
  });
