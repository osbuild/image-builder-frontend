import React from 'react';

import { Td } from '@patternfly/react-table';

import {
  ApiRepositoryParameterResponse,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';

import RepositoriesStatus from './RepositoriesStatus';

import {
  getReadableArchitecture,
  getReadableVersions,
} from '../repositoriesUtilities';

type RepositoryColumnsProps = {
  repo: ApiRepositoryResponseRead;
  repositoryParameters: ApiRepositoryParameterResponse | undefined;
};

const RepositoryColumns = ({
  repo,
  repositoryParameters,
}: RepositoryColumnsProps) => {
  const {
    url = '',
    status = '',
    distribution_arch,
    distribution_versions,
    package_count,
    last_introspection_time,
    failed_introspections_count,
  } = repo;

  return (
    <>
      <Td dataLabel={'Version'}>
        {getReadableVersions(distribution_versions, repositoryParameters)}
      </Td>
      <Td dataLabel={'Architecture'}>
        {getReadableArchitecture(distribution_arch, repositoryParameters)}
      </Td>
      <Td dataLabel={'Packages'}>{package_count || '-'}</Td>
      <Td dataLabel={'Status'}>
        <RepositoriesStatus
          repoStatus={status || 'Unavailable'}
          repoUrl={url}
          repoIntrospections={last_introspection_time}
          repoFailCount={failed_introspections_count}
        />
      </Td>
    </>
  );
};

export default RepositoryColumns;
