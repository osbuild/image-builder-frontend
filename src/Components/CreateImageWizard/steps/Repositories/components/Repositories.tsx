import React, { useEffect, useMemo, useRef, useState } from 'react';

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
  useListRepositoriesQuery,
  useListRepositoryParametersQuery,
  useListSnapshotsByDateMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addRepository,
  removeRepositoriesById,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectPayloadRepositories,
  selectSnapshotDate,
  selectUseLatest,
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
  const version = releaseToVersion(distribution);

  const [modalOpen, setModalOpen] = useState(false);
  const [reposToRemove, setReposToRemove] = useState<string[]>([]);
  const [isStatusPollingEnabled, setIsStatusPollingEnabled] = useState(false);
  const [unavailableRepoCount, setUnavailableRepoCount] = useState(0);

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

  const initialSelectedRef = useRef(new Set([...selected]));
  const foundUnavailableRepos = useRef(false);

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
      { skip: requiredUrls.length === 0 },
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
      limit: selected.size + requiredRedHatRepoUUIDs.length,
      offset: 0,
      uuid: [...selected, ...requiredRedHatRepoUUIDs].join(','),
    },
    {
      refetchOnMountOrArgChange: 60,
      skip: !hasReposToShow,
      pollingInterval: isStatusPollingEnabled ? 8000 : 0,
    },
  );

  const checkRepoDisabled = useIsRepoDisabled(
    contentList,
    selected,
    isFetching,
  );

  useEffect(() => {
    if (initialSelectedRef.current.size > 0) {
      refetchMain();
    }
    // Force refetch on mount when there are preselected repos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // contentList and pollingInterval depend on each other, so we can't replace this with a useMemo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStatusPollingEnabled(
      contentList.some((repo) => repo.status === 'Pending'),
    );
  }, [contentList]);

  // Auto-swap custom EPEL repos, due to their deletion, to their community counterparts on initial load
  // REF: HMS-5853
  useEffect(() => {
    if (isLoading) return;

    const customEpel = customRepositories.find(
      (repo) => repo.baseurl?.length && isEPELUrl(repo.baseurl[0]) && repo.id,
    );
    if (!customEpel) return;

    const communityEpel = contentList.find(
      (repo) => repo.origin === ContentOrigin.COMMUNITY && isEPELUrl(repo.url!),
    );
    if (!communityEpel?.uuid || customEpel.id === communityEpel.uuid) return;

    dispatch(removeRepositoriesById([customEpel.id!]));
    dispatch(addRepository({ repo: communityEpel }));
    // ↓ On purpose to prevent repeated executions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const removeSelected = (repo: ApiRepositoryResponseRead) => {
    if (repo.uuid) {
      dispatch(removeRepositoriesById([repo.uuid]));
    }
  };

  const handleRemove = (repo: ApiRepositoryResponseRead) => {
    const isInitiallySelected =
      repo.uuid && initialSelectedRef.current.has(repo.uuid);

    if (isInitiallySelected) {
      setModalOpen(true);
      setReposToRemove([repo.uuid as string]);
      return;
    }

    removeSelected(repo);
  };

  useEffect(() => {
    if (isFetching || isError || initialSelectedRef.current.size === 0) return;
    if (foundUnavailableRepos.current) return;

    foundUnavailableRepos.current = true;

    const contentUuids = new Set(contentList.map(({ uuid }) => uuid));
    const missingUuids = [...initialSelectedRef.current].filter(
      (uuid) => !contentUuids.has(uuid),
    );

    setUnavailableRepoCount(missingUuids.length);
    if (missingUuids.length > 0) {
      dispatch(removeRepositoriesById(missingUuids));
    }
  }, [dispatch, isFetching, isError, contentList]);

  const [
    listSnapshotsByDate,
    {
      data: snapshotsByDate,
      isError: isSnapshotsError,
      isLoading: isSnapshotsLoading,
    },
  ] = useListSnapshotsByDateMutation();

  useEffect(() => {
    if (!snapshotDate || useLatestContent || !contentList.length) {
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
  }, [contentList, listSnapshotsByDate, snapshotDate, useLatestContent]);

  if (isError || isSnapshotsError) {
    return <Error />;
  }

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
                onSelectRepository={(repo) => dispatch(addRepository({ repo }))}
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
};

export default Repositories;
