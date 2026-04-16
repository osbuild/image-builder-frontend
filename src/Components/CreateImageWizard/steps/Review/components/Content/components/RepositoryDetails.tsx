import React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

import { ContentOrigin } from '@/constants';
import { useListRepositoriesQuery } from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectAllRepositoryIds } from '@/store/slices';

import { RepositoryLabel } from './RepositoryLabel';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const RepositoryDetails = ({ shouldHide }: Hideable) => {
  const repositories = useAppSelector(selectAllRepositoryIds);
  const validRepos = repositories.filter((id): id is string => Boolean(id));

  const { data, isLoading, isFetching, isError } = useListRepositoriesQuery(
    {
      uuid: validRepos.join(','),
      contentType: 'rpm',
      origin: [ContentOrigin.ALL, ContentOrigin.COMMUNITY].join(','),
    },
    { skip: shouldHide || validRepos.length === 0 },
  );

  if (shouldHide) {
    return null;
  }

  const namesByUuid = new Map<string, string>();
  if (data?.data) {
    for (const repo of data.data) {
      if (repo.uuid && repo.name) {
        namesByUuid.set(repo.uuid, repo.name);
      }
    }
  }

  return (
    <ReviewGroup
      heading='Repositories'
      description={
        <LabelGroup aria-label='Custom repositories'>
          {validRepos.map((uuid, index) => (
            <RepositoryLabel
              key={`repo-review-${index}`}
              uuid={uuid}
              name={isError ? undefined : namesByUuid.get(uuid)}
              isLoading={isLoading || isFetching}
            />
          ))}
          {validRepos.length === 0 && <Label>No repositories selected</Label>}
        </LabelGroup>
      }
    />
  );
};
