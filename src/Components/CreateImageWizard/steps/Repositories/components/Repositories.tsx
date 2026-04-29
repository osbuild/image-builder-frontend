import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  FormGroup,
  Grid,
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
  changeCustomRepositories,
  changePayloadRepositories,
  changeRedHatRepositories,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectGroups,
  selectPackages,
  selectPayloadRepositories,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectUseLatest,
} from '@/store/slices/wizard';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import { requiredRedHatRepos } from '@/Utilities/requiredRedHatRepos';
import {
  convertStringToDate,
  timestampToDisplayStringDetailed,
} from '@/Utilities/time';

import CommunityRepositoryLabel from './CommunityRepositoryLabel';
import CustomEpelWarning from './CustomEpelWarning';
import Empty from './Empty';
import Error from './Error';
import Loading from './Loading';
import RemoveRepositoryButton from './RemoveRepositoryButton';
import RemoveRepositoryModal from './RemoveRepositoryModal';
import RepositoriesAddedAlert from './RepositoriesAddedAlert';
import RepositoriesStatus from './RepositoriesStatus';
import RepositorySearch from './RepositorySearch';
import RepositoryUnavailable from './RepositoryUnavailable';
import UploadRepositoryLabel from './UploadRepositoryLabel';

import {
  convertSchemaToIBCustomRepo,
  convertSchemaToIBPayloadRepo,
  excludeEUSReposFilter,
  getReadableArchitecture,
  getReadableVersions,
  isEPELUrl,
  isRepoDisabled,
} from '../repositoriesUtilities';

const Repositories = () => {
  const dispatch = useAppDispatch();

  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const useLatestContent = useAppSelector(selectUseLatest);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const payloadRepositories = useAppSelector(selectPayloadRepositories);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
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
          ...recommendedRepos.map(({ uuid }) => uuid),
        ].filter((id) => !!id) as string[],
      ),
    [customRepositories, payloadRepositories, recommendedRepos],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialSelectedState = useMemo(() => new Set([...selected]), []);

  const {
    data: { data: previousReposData = [] } = {},
    isLoading: previousLoading,
    isSuccess: previousSuccess,
    refetch: refetchInitial,
  } = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      ...excludeEUSReposFilter,
      limit: 999, // O.O Oh dear, if possible this whole call should be removed
      offset: 0,
      uuid: [...initialSelectedState].join(','),
    },
    { refetchOnMountOrArgChange: false, skip: isTemplateSelected },
  );

  const requiredRedHatRepoUUIDs = useMemo(() => {
    const requiredUrls = requiredRedHatRepos(arch, version) || [];
    return previousReposData
      .filter((repo) => requiredUrls.includes(repo.url!))
      .map((repo) => repo.uuid!)
      .filter((uuid): uuid is string => !!uuid);
  }, [arch, version, previousReposData]);

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

    dispatch(
      changeCustomRepositories([
        ...customRepositories.filter(({ id }) => id !== customEpel.id),
        convertSchemaToIBCustomRepo(communityEpel),
      ]),
    );
    dispatch(
      changePayloadRepositories([
        ...payloadRepositories.filter(({ id }) => !id || id !== customEpel.id),
        convertSchemaToIBPayloadRepo(communityEpel),
      ]),
    );
    // ↓ On purpose to prevent repeated executions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const refresh = () => {
    // In case the user deletes an initially selected repository.
    // Refetching will react to both added and removed repositories.
    refetchMain();
    refetchInitial();
  };

  const addSelected = (repo: ApiRepositoryResponseRead) => {
    const customToAdd = convertSchemaToIBCustomRepo(repo);
    const payloadToAdd = convertSchemaToIBPayloadRepo(repo);

    dispatch(changeCustomRepositories([...customRepositories, customToAdd]));
    dispatch(changePayloadRepositories([...payloadRepositories, payloadToAdd]));
  };

  const removeSelected = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
  ) => {
    const itemsToRemove = Array.isArray(repo)
      ? new Set(repo.map(({ uuid }) => uuid))
      : new Set([repo.uuid]);

    dispatch(
      changeCustomRepositories(
        customRepositories.filter(({ id }) => !itemsToRemove.has(id)),
      ),
    );

    dispatch(
      changePayloadRepositories(
        payloadRepositories.filter(({ id }) => !itemsToRemove.has(id)),
      ),
    );
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

  const previousReposNowUnavailable: number = useMemo(() => {
    if (
      !previousLoading &&
      previousSuccess &&
      previousReposData.length !== initialSelectedState.size &&
      previousReposData.length < initialSelectedState.size
    ) {
      const prevSet = new Set(previousReposData.map(({ uuid }) => uuid));
      const itemsToRemove = [...initialSelectedState]
        .filter((uuid) => !prevSet.has(uuid))
        .map((uuid) => ({ uuid })) as ApiRepositoryResponseRead[];
      removeSelected(itemsToRemove);
      return initialSelectedState.size - previousReposData.length;
    }
    return 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previousLoading,
    previousSuccess,
    previousReposData,
    initialSelectedState,
  ]);

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

      dispatch(
        changeCustomRepositories(
          customReposInTemplate.map((repo) =>
            convertSchemaToIBCustomRepo(repo!),
          ),
        ),
      );

      dispatch(
        changePayloadRepositories(
          customReposInTemplate.map((repo) =>
            convertSchemaToIBPayloadRepo(repo!),
          ),
        ),
      );

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
    isLoading ||
    previousLoading ||
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
        <FormGroup label='Repositories'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
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
                  onClick={() => refresh()}
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
            {previousReposNowUnavailable > 0 && (
              <RepositoryUnavailable quantity={previousReposNowUnavailable} />
            )}
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
                    const {
                      uuid = '',
                      url = '',
                      name,
                      status = '',
                      origin = '',
                      distribution_arch,
                      distribution_versions,
                      package_count,
                      last_introspection_time,
                      failed_introspections_count,
                    } = repo;

                    const [isDisabled, disabledReason] = isRepoDisabled(
                      repo,
                      selected.has(uuid),
                      isFetching,
                      contentList,
                      selected,
                      recommendedRepos,
                      packages,
                      groups,
                      useLatestContent,
                      arch,
                      version,
                    );

                    const snapshot = snapshotsByDate?.data?.find(
                      (s) => s.repository_uuid === uuid,
                    );
                    const snapshotPackages =
                      snapshot?.match?.content_counts?.['rpm.package'];

                    return (
                      <Tr key={`${uuid}-${rowIndex}`}>
                        <Td dataLabel={'Name'}>
                          {name}
                          {origin === ContentOrigin.UPLOAD ? (
                            <UploadRepositoryLabel />
                          ) : origin === ContentOrigin.COMMUNITY ? (
                            <CommunityRepositoryLabel />
                          ) : (
                            isEPELUrl(url) && <CustomEpelWarning />
                          )}
                        </Td>
                        {!snapshotDate ? (
                          <>
                            <Td dataLabel={'Version'}>
                              {getReadableVersions(
                                distribution_versions,
                                repositoryParameters,
                              )}
                            </Td>
                            <Td dataLabel={'Architecture'}>
                              {getReadableArchitecture(
                                distribution_arch,
                                repositoryParameters,
                              )}
                            </Td>
                            <Td dataLabel={'Packages'}>
                              {package_count || '-'}
                            </Td>
                            <Td dataLabel={'Status'}>
                              <RepositoriesStatus
                                repoStatus={status || 'Unavailable'}
                                repoUrl={url}
                                repoIntrospections={last_introspection_time}
                                repoFailCount={failed_introspections_count}
                              />
                            </Td>
                          </>
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
                  {reposInTemplate.map((repo, rowIndex) => {
                    const {
                      uuid = '',
                      url = '',
                      name,
                      status = '',
                      distribution_arch,
                      distribution_versions,
                      package_count,
                      last_introspection_time,
                      failed_introspections_count,
                    } = repo;

                    return (
                      <Tr key={`${uuid}-${rowIndex}`}>
                        <Td dataLabel={'Name'}>{name}</Td>
                        <Td dataLabel={'Version'}>
                          {getReadableVersions(
                            distribution_versions,
                            repositoryParameters,
                          )}
                        </Td>
                        <Td dataLabel={'Architecture'}>
                          {getReadableArchitecture(
                            distribution_arch,
                            repositoryParameters,
                          )}
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
                      </Tr>
                    );
                  })}
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
