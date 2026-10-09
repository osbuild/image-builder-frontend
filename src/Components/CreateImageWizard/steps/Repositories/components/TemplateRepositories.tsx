import React, { useEffect } from 'react';

import { Grid, Panel, PanelMain } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ContentOrigin } from '@/constants';
import {
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useListRepositoryParametersQuery,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeRedHatRepositories,
  convertSchemaToIBPayloadRepo,
  selectTemplate,
  setRepositoriesFromContentSources,
} from '@/store/slices/wizard';

import Error from './Error';
import Loading from './Loading';
import RepositoriesAddedAlert from './RepositoriesAddedAlert';
import RepositoryColumns from './RepositoryColumns';

const TemplateRepositories = () => {
  const dispatch = useAppDispatch();
  const templateUuid = useAppSelector(selectTemplate);

  const { data: repositoryParameters } = useListRepositoryParametersQuery();

  const {
    data: selectedTemplateData,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = useGetTemplateQuery(
    {
      uuid: templateUuid,
    },
    { refetchOnMountOrArgChange: true },
  );

  const {
    data: { data: reposInTemplate = [] } = {},
    isError: isReposInTemplateError,
    isLoading: isReposInTemplateLoading,
    isFetching: isReposInTemplateFetching,
  } = useListRepositoriesQuery(
    {
      contentType: 'rpm',
      limit: selectedTemplateData?.repository_uuids?.length || 100,
      offset: 0,
      uuid: selectedTemplateData?.repository_uuids?.join(',') ?? '',
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedTemplateData?.repository_uuids,
    },
  );

  useEffect(() => {
    if (reposInTemplate.length > 0) {
      const customReposInTemplate = reposInTemplate.filter(
        (repo) => repo.origin !== ContentOrigin.REDHAT,
      );
      const redHatReposInTemplate = reposInTemplate.filter(
        (repo) => repo.origin === ContentOrigin.REDHAT,
      );

      dispatch(setRepositoriesFromContentSources(customReposInTemplate));

      dispatch(
        changeRedHatRepositories(
          redHatReposInTemplate.map((repo) =>
            convertSchemaToIBPayloadRepo(repo!),
          ),
        ),
      );
    }
  }, [dispatch, templateUuid, reposInTemplate]);

  if (isTemplateError || isReposInTemplateError) {
    return <Error />;
  }

  if (
    isTemplateLoading ||
    isReposInTemplateLoading ||
    isReposInTemplateFetching
  ) {
    return <Loading />;
  }

  return (
    <>
      <RepositoriesAddedAlert templateUuid={templateUuid} />
      <Grid>
        <Panel>
          <PanelMain>
            <Table>
              <Thead>
                <Tr>
                  <Th width={45}>Name</Th>
                  <Th>Version</Th>
                  <Th width={15}>Architecture</Th>
                  <Th width={10}>Packages</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reposInTemplate.map((repo) => (
                  <Tr key={repo.uuid}>
                    <Td dataLabel={'Name'}>{repo.name}</Td>
                    <RepositoryColumns
                      repo={repo}
                      repositoryParameters={repositoryParameters}
                    />
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </PanelMain>
        </Panel>
      </Grid>
    </>
  );
};

export default TemplateRepositories;
