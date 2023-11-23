import { useMemo } from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';

import { releaseToVersion } from './releaseToVersion';

import { useListRepositoriesQuery } from '../store/contentSourcesApi';

/**
 * This checks the list of the payload repositories against a list of repos freshly
 * fetched from content source API and returns true whether there are some
 * repositories that are no longer available in the Repositories service.
 *
 * (The payload repositories are comming from the useFormApi hook).
 */
export const useCheckRepositoriesAvailability = () => {
  const { getState } = useFormApi();

  const arch = getState().values?.arch;
  const release = getState().values?.release;
  const version = releaseToVersion(release);

  // There needs to be two requests because the default limit for the
  // useListRepositoriesQuery is a 100 elements, and a first request is
  // necessary to know the total amount of elements to fetch.
  const firstRequest = useListRepositoriesQuery({
    availableForArch: arch,
    availableForVersion: version,
    contentType: 'rpm',
    origin: 'external',
  });

  const skip =
    firstRequest?.data?.meta?.count === undefined ||
    firstRequest?.data?.meta?.count <= 100;

  // Fetch *all* repositories if there are more than 100
  const followupRequest = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      contentType: 'rpm',
      origin: 'external',
      limit: firstRequest?.data?.meta?.count,
      offset: 0,
    },
    {
      skip: skip,
    }
  );

  const { data: freshRepos, isSuccess } = useMemo(() => {
    if (firstRequest?.data?.meta?.count > 100) {
      return { ...followupRequest };
    }
    return { ...firstRequest };
  }, [firstRequest, followupRequest]);

  const payloadRepositories = getState()?.values?.['payload-repositories'];
  // payloadRepositories existing === we came here from Recreate
  if (isSuccess && payloadRepositories) {
    // Transform the fresh repos array into a Set to access its elements in O(1)
    // complexity later in the for loop.
    const freshReposUrls = new Set(
      freshRepos.data.map((freshRepo) => freshRepo.url)
    );
    for (const payloadRepo of payloadRepositories) {
      if (!freshReposUrls.has(payloadRepo.baseurl)) {
        return true;
      }
    }
  }
  return false;
};
