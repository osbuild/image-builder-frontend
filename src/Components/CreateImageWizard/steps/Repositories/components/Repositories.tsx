import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
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
  selectPayloadRepositories,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectUseLatest,
  selectWizardMode,
} from '@/store/slices/wizard';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import { requiredRedHatRepos } from '@/Utilities/requiredRedHatRepos';
import {
  convertStringToDate,
  timestampToDisplayStringDetailed,
} from '@/Utilities/time';
import { useFlag } from '@/Utilities/useGetEnvironment';

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
  getReadableArchitecture,
  getReadableVersions,
  isEPELUrl,
  isRepoDisabled,
} from '../repositoriesUtilities';

// Until IB has full support for extended release repositories, filter them out
export const excludeEUSReposFilter = { extendedRelease: 'none' };

const Repositories = () => {
  const dispatch = useAppDispatch();

  const wizardMode = useAppSelector(selectWizardMode);
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const useLatestContent = useAppSelector(selectUseLatest);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const payloadRepositories = useAppSelector(selectPayloadRepositories);
  const recommendedRepos = useAppSelector(selectRecommendedRepositories);
  const templateUuid = useAppSelector(selectTemplate);

  const version = releaseToVersion(distribution);

  const [modalOpen, setModalOpen] = useState(false);
  const [reposToRemove, setReposToRemove] = useState<string[]>([]);
  const [isTemplateSelected, setIsTemplateSelected] = useState(false);
  const [isStatusPollingEnabled, setIsStatusPollingEnabled] = useState(false);

  const isLayeredReposEnabled = useFlag('image-builder.layered-repos.enabled');

  const originParam = useMemo(() => {
    const origins = [ContentOrigin.CUSTOM];
    origins.push(ContentOrigin.COMMUNITY);
    if (isLayeredReposEnabled) origins.push(ContentOrigin.REDHAT);
    return origins.join(',');
  }, [isLayeredReposEnabled]);

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
    refetch: refetchIntial,
  } = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      ...excludeEUSReposFilter,
      origin: originParam,
      limit: 999, // O.O Oh dear, if possible this whole call should be removed
      offset: 0,
      uuid: [...initialSelectedState].join(','),
    },
    { refetchOnMountOrArgChange: false, skip: isTemplateSelected },
  );

  useEffect(() => {
    setIsTemplateSelected(templateUuid !== '');
  }, [templateUuid]);

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
      origin: originParam,
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
    if (contentList.some((repo) => repo.status === 'Pending')) {
      setIsStatusPollingEnabled(true);
    } else {
      setIsStatusPollingEnabled(false);
    }
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
    // In case the user deletes an intially selected repository.
    // Refetching will react to both added and removed repositories.
    refetchMain();
    refetchIntial();
  };

  const addSelected = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
  ) => {
    let reposToAdd: ApiRepositoryResponseRead[] = [];
    // Check if array of items
    if ((repo as ApiRepositoryResponseRead[]).length) {
      reposToAdd = (repo as ApiRepositoryResponseRead[]).filter(
        (r) =>
          r.uuid &&
          !isRepoDisabled(
            r,
            selected.has(r.uuid),
            isFetching,
            contentList,
            selected,
          )[0] &&
          !selected.has(r.uuid),
      );
    } else {
      // Then it should be a single item
      const singleRepo = repo as ApiRepositoryResponseRead;
      if (
        singleRepo.uuid &&
        !isRepoDisabled(
          singleRepo,
          selected.has(singleRepo.uuid),
          isFetching,
          contentList,
          selected,
        )[0] &&
        !selected.has(singleRepo.uuid)
      ) {
        reposToAdd.push(singleRepo);
      }
    }

    const customToAdd = reposToAdd.map((repo) =>
      convertSchemaToIBCustomRepo(repo!),
    );

    const payloadToAdd = reposToAdd.map((repo) =>
      convertSchemaToIBPayloadRepo(repo!),
    );

    dispatch(changeCustomRepositories([...customRepositories, ...customToAdd]));
    dispatch(
      changePayloadRepositories([...payloadRepositories, ...payloadToAdd]),
    );
  };

  const removeSelected = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
  ) => {
    if ((repo as ApiRepositoryResponseRead[]).length) {
      const itemsToRemove = new Set(
        (repo as ApiRepositoryResponseRead[]).map(({ uuid }) => uuid),
      );

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

      return;
    }

    const uuidToRemove = (repo as ApiRepositoryResponseRead).uuid;
    if (uuidToRemove) {
      dispatch(
        changeCustomRepositories(
          customRepositories.filter(({ id }) => uuidToRemove !== id),
        ),
      );
      dispatch(
        changePayloadRepositories(
          payloadRepositories.filter(({ id }) => uuidToRemove !== id),
        ),
      );
    }
  };

  const handleAddRemove = (
    repo: ApiRepositoryResponseRead | ApiRepositoryResponseRead[],
    selected: boolean,
  ) => {
    if (selected) return addSelected(repo);
    if ((repo as ApiRepositoryResponseRead[]).length) {
      const initiallySelectedItems = (repo as ApiRepositoryResponseRead[]).map(
        ({ uuid }) => uuid,
      );

      const hasSome = initiallySelectedItems.some(
        (uuid) => uuid && initialSelectedState.has(uuid),
      );

      if (hasSome) {
        setModalOpen(true);
        setReposToRemove(initiallySelectedItems as string[]);
        return;
      }
    } else {
      const isInitiallySelected =
        (repo as ApiRepositoryResponseRead).uuid &&
        initialSelectedState.has(
          (repo as ApiRepositoryResponseRead).uuid || '',
        );
      if (isInitiallySelected) {
        setModalOpen(true);
        setReposToRemove([(repo as ApiRepositoryResponseRead).uuid as string]);
        return;
      }
    }
    return removeSelected(repo);
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
        {wizardMode === 'edit' && (
          <Alert
            title='Removing previously added repositories may lead to issues with selected packages'
            variant='warning'
            isPlain
            isInline
          />
        )}
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
            {previousReposNowUnavailable ? (
              <RepositoryUnavailable quantity={previousReposNowUnavailable} />
            ) : (
              ''
            )}
            {contentList.length === 0 ? (
              <Empty hasFilterValue={false} refetch={refresh} />
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th width={45}>Name</Th>
                    {!snapshotDate ? (
                      <>
                        <Th width={15}>Architecture</Th>
                        <Th>Version</Th>
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
                    );

                    const snapshot = snapshotsByDate?.data?.find(
                      (s) => s.repository_uuid === uuid,
                    );
                    const packages =
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
                            <Td dataLabel={'Architecture'}>
                              {getReadableArchitecture(
                                distribution_arch,
                                repositoryParameters,
                              )}
                            </Td>
                            <Td dataLabel={'Version'}>
                              {getReadableVersions(
                                distribution_versions,
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
                                packages && snapshot.match?.uuid ? (
                                  <Button
                                    component='a'
                                    target='_blank'
                                    variant='link'
                                    icon={<ExternalLinkAltIcon />}
                                    iconPosition='right'
                                    isInline
                                    href={`${CONTENT_URL}/${uuid}/snapshots/${snapshot.match.uuid}`}
                                  >
                                    {packages}
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
                            onRemove={(repo) => handleAddRemove(repo, false)}
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
                    <Th width={15}>Architecture</Th>
                    <Th>Version</Th>
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
                        <Td dataLabel={'Architecture'}>
                          {getReadableArchitecture(
                            distribution_arch,
                            repositoryParameters,
                          )}
                        </Td>
                        <Td dataLabel={'Version'}>
                          {getReadableVersions(
                            distribution_versions,
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
