import { useMemo } from 'react';

import { EPEL_10_REPO_DEFINITION } from '@/constants';
import { useGetArchitecturesQuery } from '@/store/api/backend';
import {
  useGetTemplateQuery,
  useListRepositoriesQuery,
} from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectSnapshotDate,
  selectTemplate,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { convertStringToDate } from '@/Utilities/time';

const EMPTY_ARRAY: never[] = [];

export const useSearchSetup = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const formattedSnapshotDate = useMemo(() => {
    if (!snapshotDate) {
      return undefined;
    }
    const parsed = convertStringToDate(snapshotDate);
    if (isNaN(parsed)) {
      return undefined;
    }
    return new Date(parsed).toISOString();
  }, [snapshotDate]);

  const customRepoUuids = useMemo(
    () => customRepositories.flatMap((repo) => repo.id),
    [customRepositories],
  );

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useGetArchitecturesQuery({
      distribution: distribution,
    });

  const distroUrls = useMemo(() => {
    const urls = distroRepositories
      ?.find((archItem) => archItem.arch === arch)
      ?.repositories.filter((repo) => !!repo.baseurl)
      .map((repo) => repo.baseurl!);
    return urls ?? EMPTY_ARRAY;
  }, [distroRepositories, arch]);

  const { data: templateData } = useGetTemplateQuery({
    uuid: template,
  });

  const { data: { data: reposInTemplate = EMPTY_ARRAY } = {} } =
    useListRepositoriesQuery({
      contentType: 'rpm',
      limit: 100,
      offset: 0,
      uuid:
        templateData && templateData.repository_uuids
          ? templateData.repository_uuids.join(',')
          : '',
    });

  return {
    isOnPremise,
    distribution,
    arch,
    template,
    distroUrls,
    customRepoUuids,
    reposInTemplate,
    isSuccessDistroRepositories,
    formattedSnapshotDate,
    epelRepoUrlByDistribution,
  };
};
