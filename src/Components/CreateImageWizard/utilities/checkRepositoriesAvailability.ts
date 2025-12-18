import { useMemo } from 'react';

import { ContentOrigin, PAGINATION_LIMIT } from '../../../constants';
import { useListRepositoriesQuery } from '../../../store/contentSourcesApi';
import { useAppSelector } from '../../../store/hooks';
import {
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
} from '../../../store/wizardSlice';
import { releaseToVersion } from '../../../Utilities/releaseToVersion';

/**
 * This checks the list of the custom repositories against a list of repos freshly
 * fetched from content source API and returns true whether there are some
 * repositories that are no longer available in the Repositories service.
 */
export const useCheckRepositoriesAvailability = () => {
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);

  // There needs to be two requests because the default limit for the
  // useListRepositoriesQuery is a 100 elements, and a first request is
  // necessary to know the total amount of elements to fetch.
  const firstRequest = useListRepositoriesQuery({
    availableForArch: arch,
    availableForVersion: version,
    contentType: 'rpm',
    origin: ContentOrigin.EXTERNAL,
  });

  const skip =
    firstRequest.data?.meta?.count === undefined ||
    firstRequest.data.meta.count <= 100;

  // Fetch *all* repositories if there are more than 100
  const followupRequest = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      contentType: 'rpm',
      origin: ContentOrigin.EXTERNAL,
      limit: firstRequest.data?.meta?.count || PAGINATION_LIMIT,
      offset: 0,
    },
    {
      skip: skip,
    },
  );

  const { data: freshRepos, isSuccess } = useMemo(() => {
    if (firstRequest.data?.meta?.count) {
      if (firstRequest.data.meta.count > 100) {
        return { ...followupRequest };
      }
    }
    return { ...firstRequest };
  }, [firstRequest, followupRequest]);

  const customRepositories = useAppSelector(selectCustomRepositories);
  // customRepositories existing === we came here from Recreate
  if (isSuccess && customRepositories.length > 0) {
    // Transform the fresh repos array into a Set to access its elements in O(1)
    // complexity later in the for loop.
    const freshReposUrls = new Set(
      freshRepos.data?.map((freshRepo) => freshRepo.url),
    );
    for (const customRepo of customRepositories) {
      if (customRepo.baseurl && !freshReposUrls.has(customRepo.baseurl[0])) {
        return true;
      }
    }
  }
  return false;
};
