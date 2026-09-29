import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  FormGroup,
  Grid,
  Label,
  Panel,
  PanelMain,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { CONTENT_URL, ContentOrigin } from '@/constants';
import {
  ApiRepositoryResponseRead,
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useListRepositoryParametersQuery,
  useListSnapshotsByDateMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addRepository,
  changeRedHatRepositories,
  convertSchemaToIBPayloadRepo,
  removeRepositoriesById,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectPayloadRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectUseLatest,
  setRepositoriesFromContentSources,
} from '@/store/slices/wizard';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import { requiredRedHatRepos } from '@/Utilities/requiredRedHatRepos';
import {
  convertStringToDate,
  timestampToDisplayStringDetailed,
} from '@/Utilities/time';

import Empty from './Empty';
import Error from './Error';
import Loading from './Loading';
import RemoveRepositoryButton from './RemoveRepositoryButton';
import RemoveRepositoryModal from './RemoveRepositoryModal';
import RepositoriesAddedAlert from './RepositoriesAddedAlert';
import RepositoryColumns from './RepositoryColumns';
import RepositoryLabel from './RepositoryLabel';
import RepositorySearch from './RepositorySearch';
import RepositoryUnavailable from './RepositoryUnavailable';

import {
  excludeEUSReposFilter,
  isEPELUrl,
  useIsRepoDisabled,
} from '../repositoriesUtilities';

const Repositories = () => {
  const dispatch = useAppDispatch();

  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const useLatestContent = useAppSelector(selectUseLatest);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const payloadRepositories = useAppSelector(selectPayloadRepositories);
  const templateUuid = useAppSelector(selectTemplate);

  const version = releaseToVersion(distribution);

  const [modalOpen, setModalOpen] = useState(false);
  const [reposToRemove, setReposToRemove] = useState<string[]>([]);
  const [isStatusPollingEnabled, setIsStatusPollingEnabled] = useState(false);

  const isTemplateSelected = templateUuid !== '';

  const { data: repositoryParameters } = useListRepositoryParametersQuery();

  const selected = useMemo(
    () =>
      new Set(
        [
          ...customRepositories.map(({ id }) => id).flat(1),
          ...payloadRepositories.map(({ id }) => id),
        ].filter((id) => !!id) as string[],
      ),
    [customRepositories, payloadRepositories],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialSelectedState = useMemo(() => new Set([...selected]), []);

  const requiredUrls = useMemo(
    () => requiredRedHatRepos(arch, version) || [],
    [arch, version],
  );

  const { data: { data: requiredReposData = [] } = {} } =
    useListRepositoriesQuery(
      {
        url: requiredUrls.join(','),
        limit: requiredUrls.length,
      },
      { skip: requiredUrls.length === 0 || isTemplateSelected },
    );

  const requiredRedHatRepoUUIDs = useMemo(
    () =>
      requiredReposData
        .map((repo) => repo.uuid)
        .filter((uuid): uuid is string => !!uuid),
    [requiredReposData],
  );

  const hasReposToShow =
    selected.size > 0 || requiredRedHatRepoUUIDs.length > 0;

  const {
    data: { data: contentList = [] } = {},
    isError,
    isFetching,
    isLoading,
    refetch: refetchMain,
  } = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      ...excludeEUSReposFilter,
      contentType: 'rpm',
      limit: 100,
      offset: 0,
      uuid: [...selected, ...requiredRedHatRepoUUIDs].join(','),
    },
    {
      refetchOnMountOrArgChange: 60,
      skip: isTemplateSelected || !hasReposToShow,
      pollingInterval: isStatusPollingEnabled ? 8000 : 0,
    },
  );

  const checkRepoDisabled = useIsRepoDisabled(
    contentList,
    selected,
    isFetching,
  );

  useEffect(() => {
    if (initialSelectedState.size > 0) {
      refetchMain();
    }
    // Force refetch on mount when there are preselected repos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsStatusPollingEnabled(
      contentList.some((repo) => repo.status === 'Pending'),
    );
  }, [contentList]);

  // Auto-swap custom EPEL repos, due to their deletion, to their community counterparts on initial load
  // REF: HMS-5853
  useEffect(() => {
    if (isLoading || isTemplateSelected) return;

    const customEpel = customRepositories.find(
      (repo) => repo.baseurl?.length && isEPELUrl(repo.baseurl[0]) && repo.id,
    );
    if (!customEpel) return;

    const communityEpel = [...contentList].find(
      (repo) => repo.origin === ContentOrigin.COMMUNITY && isEPELUrl(repo.url!),
    );
    if (!communityEpel?.uuid || customEpel.id === communityEpel.uuid) return;

    dispatch(removeRepositoriesById([customEpel.id!]));
    dispatch(addRepository({ repo: communityEpel }));
    // ↓ On purpose to prevent repeated executions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const addSelected = (repo: ApiRepositoryResponseRead) => {
    dispatch(addRepository({ repo }));
  };

  const removeSelected = (repo: ApiRepositoryResponseRead) => {
    if (repo.uuid) {
      dispatch(removeRepositoriesById([repo.uuid]));
    }
  };

  const handleRemove = (repo: ApiRepositoryResponseRead) => {
    const isInitiallySelected =
      repo.uuid && initialSelectedState.has(repo.uuid);

    if (isInitiallySelected) {
      setModalOpen(true);
      setReposToRemove([repo.uuid as string]);
      return;
    }

    removeSelected(repo);
  };

  useEffect(() => {
    if (isFetching || initialSelectedState.size === 0) return;

    const contentUuids = new Set(contentList.map(({ uuid }) => uuid));
    const missingUuids = [...initialSelectedState].filter(
      (uuid) => !contentUuids.has(uuid),
    );

    if (missingUuids.length > 0) {
      dispatch(removeRepositoriesById(missingUuids));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, contentList, initialSelectedState]);

  const unavailableRepoCount =
    !isLoading && initialSelectedState.size > 0
      ? [...initialSelectedState].filter(
          (uuid) => !contentList.some((repo) => repo.uuid === uuid),
        ).length
      : 0;

  const {
    data: selectedTemplateData,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = useGetTemplateQuery(
    {
      uuid: templateUuid,
    },
    { refetchOnMountOrArgChange: true, skip: templateUuid === '' },
  );

  const {
    data: { data: reposInTemplate = [] } = {},
    isError: isReposInTemplateError,
    isLoading: isReposInTemplateLoading,
    isFetching: isReposInTemplateFetching,
  } = useListRepositoriesQuery(
    {
      contentType: 'rpm',
      limit: 100,
      offset: 0,
      uuid:
        selectedTemplateData && selectedTemplateData.repository_uuids
          ? selectedTemplateData.repository_uuids.join(',')
          : '',
    },
    { refetchOnMountOrArgChange: true, skip: !isTemplateSelected },
  );

  const [
    listSnapshotsByDate,
    {
      data: snapshotsByDate,
      isError: isSnapshotsError,
      isLoading: isSnapshotsLoading,
    },
  ] = useListSnapshotsByDateMutation();

  useEffect(() => {
    if (
      !snapshotDate ||
      useLatestContent ||
      isTemplateSelected ||
      !contentList.length
    ) {
      return;
    }

    listSnapshotsByDate({
      apiListSnapshotByDateRequest: {
        repository_uuids: contentList
          .filter((c) => !!c.uuid)
          .map((c) => c.uuid!),
        date: new Date(convertStringToDate(snapshotDate)).toISOString(),
      },
    });
  }, [
    contentList,
    listSnapshotsByDate,
    snapshotDate,
    useLatestContent,
    isTemplateSelected,
  ]);

  useEffect(() => {
    if (isTemplateSelected && reposInTemplate.length > 0) {
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
  }, [templateUuid, reposInTemplate]);

  if (
    isError ||
    isTemplateError ||
    isReposInTemplateError ||
    isSnapshotsError
  ) {
    return <Error />;
  }

  if (
    isTemplateLoading ||
    isReposInTemplateLoading ||
    isReposInTemplateFetching
  ) {
    return <Loading />;
  }

  if (!isTemplateSelected) {
    return (
      <Grid>
        <RemoveRepositoryModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          reposToRemove={reposToRemove}
          setReposToRemove={setReposToRemove}
        />
        {unavailableRepoCount > 0 && (
          <RepositoryUnavailable quantity={unavailableRepoCount} />
        )}
        <FormGroup label='Add repositories'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem style={{ width: '50%' }}>
                <RepositorySearch
                  onSelectRepository={(repo) => addSelected(repo)}
                  onRemoveRepository={(repo) => removeSelected(repo)}
                  selectedRepoIds={selected}
                />
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant='secondary'
                  isInline
                  onClick={() => refetchMain()}
                  isLoading={isFetching && !isStatusPollingEnabled}
                >
                  {isFetching && !isStatusPollingEnabled
                    ? 'Refreshing repositories'
                    : 'Refresh repositories'}
                </Button>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </FormGroup>
        <Panel>
          <PanelMain>
            {isLoading ? (
              <Loading />
            ) : (
              <>
                {!hasReposToShow || contentList.length === 0 ? (
                  <Empty />
                ) : (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th width={45}>Name</Th>
                        {!snapshotDate ? (
                          <>
                            <Th>Version</Th>
                            <Th width={15}>Architecture</Th>
                            <Th width={10}>Packages</Th>
                            <Th>Status</Th>
                          </>
                        ) : (
                          <>
                            <Th width={30}>Snapshot date</Th>
                            <Th>Packages</Th>
                          </>
                        )}
                        <Th aria-label='Remove repository' />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {contentList.map((repo, rowIndex) => {
                        const { uuid = '', url = '', name, origin = '' } = repo;

                        const [isDisabled, disabledReason] =
                          checkRepoDisabled(repo);

                        const snapshot = snapshotsByDate?.data?.find(
                          (s) => s.repository_uuid === uuid,
                        );
                        const snapshotPackages =
                          snapshot?.match?.content_counts?.['rpm.package'];

                        return (
                          <Tr key={`${uuid}-${rowIndex}`}>
                            <Td dataLabel={'Name'}>
                              {name}{' '}
                              {requiredRedHatRepoUUIDs.includes(uuid) && (
                                <Label isCompact>Required</Label>
                              )}
                              <RepositoryLabel origin={origin} url={url} />
                            </Td>
                            {!snapshotDate ? (
                              <RepositoryColumns
                                repo={repo}
                                repositoryParameters={repositoryParameters}
                              />
                            ) : (
                              <>
                                <Td dataLabel={'Snapshot date'}>
                                  {!isSnapshotsLoading ? (
                                    timestampToDisplayStringDetailed(
                                      snapshot?.match?.created_at ?? '',
                                      'UTC',
                                    ) || '-'
                                  ) : (
                                    <Spinner size='sm' />
                                  )}
                                </Td>
                                <Td dataLabel={'Packages'}>
                                  {!isSnapshotsLoading ? (
                                    snapshotPackages && snapshot.match?.uuid ? (
                                      <Button
                                        component='a'
                                        target='_blank'
                                        variant='link'
                                        icon={<ExternalLinkAltIcon />}
                                        iconPosition='right'
                                        isInline
                                        href={`${CONTENT_URL}/${uuid}/snapshots/${snapshot.match.uuid}`}
                                      >
                                        {snapshotPackages}
                                      </Button>
                                    ) : (
                                      '-'
                                    )
                                  ) : (
                                    <Spinner size='sm' />
                                  )}
                                </Td>
                              </>
                            )}
                            <Td>
                              <RemoveRepositoryButton
                                repo={repo}
                                isDisabled={isDisabled}
                                disabledReason={disabledReason}
                                onRemove={handleRemove}
                              />
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                )}
              </>
            )}
          </PanelMain>
        </Panel>
      </Grid>
    );
  } else {
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
                  {reposInTemplate.map((repo, rowIndex) => (
                    <Tr key={`${repo.uuid || ''}-${rowIndex}`}>
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
  }
};

export default Repositories;
