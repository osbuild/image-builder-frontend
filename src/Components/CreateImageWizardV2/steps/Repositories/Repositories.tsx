import React, { useMemo, useState } from 'react';

import {
  Alert,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  Panel,
  PanelMain,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  EmptyStateHeader,
  EmptyStateFooter,
  ToggleGroup,
  ToggleGroupItem,
  PaginationVariant,
} from '@patternfly/react-core';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core/deprecated';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { RepositoryIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import RepositoriesStatus from './RepositoriesStatus';
import RepositoryUnavailable from './RepositoryUnavailable';

import {
  ApiRepositoryResponseRead,
  useListRepositoriesQuery,
} from '../../../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  CustomRepository,
  Repository,
} from '../../../../store/imageBuilderApi';
import {
  changeCustomRepositories,
  changePayloadRepositories,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
} from '../../../../store/wizardSlice';
import { releaseToVersion } from '../../../../Utilities/releaseToVersion';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

type BulkSelectProps = {
  selected: (string | undefined)[];
  count: number | undefined;
  filteredCount: number | undefined;
  perPage: number;
  handleSelectAll: Function;
  handleSelectPage: Function;
  handleDeselectAll: Function;
  isDisabled: boolean;
};

const BulkSelect = ({
  selected,
  count,
  filteredCount,
  perPage,
  handleSelectAll,
  handleSelectPage,
  handleDeselectAll,
  isDisabled,
}: BulkSelectProps) => {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  const numSelected = selected.length;
  const allSelected = count !== 0 ? numSelected === count : undefined;
  const anySelected = numSelected > 0;
  const someChecked = anySelected ? null : false;
  const isChecked = allSelected ? true : someChecked;

  const items = [
    <DropdownItem
      key="none"
      onClick={() => handleDeselectAll()}
    >{`Select none (0 items)`}</DropdownItem>,
    <DropdownItem
      key="page"
      onClick={() => handleSelectPage()}
    >{`Select page (${
      perPage > filteredCount! ? filteredCount : perPage
    } items)`}</DropdownItem>,
    <DropdownItem
      key="all"
      onClick={() => handleSelectAll()}
    >{`Select all (${count} items)`}</DropdownItem>,
  ];

  const handleDropdownSelect = () => {};

  const toggleDropdown = () => setDropdownIsOpen(!dropdownIsOpen);

  return (
    <Dropdown
      onSelect={handleDropdownSelect}
      toggle={
        <DropdownToggle
          id="stacked-example-toggle"
          isDisabled={isDisabled}
          splitButtonItems={[
            <DropdownToggleCheckbox
              id="example-checkbox-1"
              key="split-checkbox"
              aria-label="Select all"
              isChecked={isChecked}
              onClick={() => {
                anySelected ? handleDeselectAll() : handleSelectAll();
              }}
            />,
          ]}
          onToggle={toggleDropdown}
        >
          {numSelected !== 0 ? `${numSelected} selected` : null}
        </DropdownToggle>
      }
      isOpen={dropdownIsOpen}
      dropdownItems={items}
    />
  );
};

// Utility function to convert from Content Sources to Image Builder custom repo API schema
export const convertSchemaToIBCustomRepo = (
  repo: ApiRepositoryResponseRead
) => {
  const imageBuilderRepo: CustomRepository = {
    id: repo.uuid!,
    name: repo.name,
    baseurl: [repo.url!],
    check_gpg: false,
  };
  if (repo.gpg_key) {
    imageBuilderRepo.gpgkey = [repo.gpg_key];
    imageBuilderRepo.check_gpg = true;
    imageBuilderRepo.check_repo_gpg = repo.metadata_verification;
  }

  return imageBuilderRepo;
};

// Utility function to convert from Content Sources to Image Builder payload repo API schema
export const convertSchemaToIBPayloadRepo = (
  repo: ApiRepositoryResponseRead
) => {
  const imageBuilderRepo: Repository = {
    baseurl: repo.url,
    rhsm: false,
    check_gpg: false,
  };
  if (repo.gpg_key) {
    imageBuilderRepo.gpgkey = repo.gpg_key;
    imageBuilderRepo.check_gpg = true;
    imageBuilderRepo.check_repo_gpg = repo.metadata_verification;
  }

  return imageBuilderRepo;
};

const Repositories = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);
  const repositoriesList = useAppSelector(selectCustomRepositories);

  const [filterValue, setFilterValue] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [toggleSelected, setToggleSelected] = useState('toggle-group-all');
  const [selected, setSelected] = useState(
    repositoriesList ? repositoriesList.flatMap((repo) => repo.baseurl) : []
  );

  const firstRequest = useListRepositoriesQuery(
    {
      availableForArch: arch,
      availableForVersion: version,
      contentType: 'rpm',
      origin: 'external',
      limit: 100,
      offset: 0,
    },
    // The cached repos may be incorrect, for now refetch on mount to ensure that
    // they are accurate when this step loads. Future PR will implement prefetching
    // and this can be removed.
    { refetchOnMountOrArgChange: true }
  );

  const skip =
    firstRequest?.data?.meta?.count === undefined ||
    firstRequest?.data?.meta?.count <= 100;

  // Fetch *all* repositories if there are more than 100 so that typeahead filter works
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
      refetchOnMountOrArgChange: true,
      skip: skip,
    }
  );

  const { data, isError, isFetching, isLoading, isSuccess, refetch } =
    useMemo(() => {
      if (firstRequest?.data?.meta?.count) {
        if (firstRequest?.data?.meta?.count > 100) {
          return { ...followupRequest };
        }
      }
      return { ...firstRequest };
    }, [firstRequest, followupRequest]);

  const handleToggleClick = (event: React.MouseEvent) => {
    const id = event.currentTarget.id;
    setPage(1);
    setToggleSelected(id);
  };

  const isRepoSelected = (repoURL: string | undefined) =>
    selected.includes(repoURL);

  const handlePerPageSelect = (
    _: React.MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleSetPage = (_: React.MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  // filter displayed selected packages
  const handleFilterRepositories = (
    event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setPage(1);
    setFilterValue(value);
  };

  const filteredRepositoryURLs = useMemo(() => {
    if (!data || !data.data) {
      return [];
    }
    const repoUrls = data.data.filter((repo) =>
      repo.name?.toLowerCase().includes(filterValue.toLowerCase())
    );
    if (toggleSelected === 'toggle-group-all') {
      return repoUrls.map((repo: ApiRepositoryResponseRead) => repo.url);
    } else if (toggleSelected === 'toggle-group-selected') {
      return repoUrls
        .filter((repo: ApiRepositoryResponseRead) => isRepoSelected(repo.url!))
        .map((repo: ApiRepositoryResponseRead) => repo.url);
    }
  }, [filterValue, data, toggleSelected]);

  const handleClearFilter = () => {
    setFilterValue('');
  };

  const updateFormState = (selectedRepoURLs: (string | undefined)[]) => {
    // repositories is stored as an object with repoURLs as keys
    const selectedRepos = [];
    for (const repoURL of selectedRepoURLs) {
      selectedRepos.push(data?.data?.find((repo) => repo.url === repoURL));
    }

    const customRepositories = selectedRepos.map((repo) =>
      convertSchemaToIBCustomRepo(repo!)
    );

    const payloadRepositories = selectedRepos.map((repo) =>
      convertSchemaToIBPayloadRepo(repo!)
    );

    dispatch(changeCustomRepositories(customRepositories));
    dispatch(changePayloadRepositories(payloadRepositories));
  };

  const updateSelected = (selectedRepos: (string | undefined)[]) => {
    setSelected(selectedRepos);
    updateFormState(selectedRepos);
  };

  const handleSelect = (
    repoURL: string | undefined,
    _: number,
    isSelecting: boolean
  ) => {
    if (isSelecting === true) {
      updateSelected([...selected, repoURL]);
    } else if (isSelecting === false) {
      updateSelected(
        selected.filter((selectedRepoId) => selectedRepoId !== repoURL)
      );
    }
  };

  const handleSelectAll = () => {
    if (data) {
      updateSelected(data.data?.map((repo) => repo.url) || []);
    }
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

  const handleSelectPage = () => {
    const pageRepos =
      filteredRepositoryURLs &&
      filteredRepositoryURLs.slice(computeStart(), computeEnd());

    // Filter to avoid adding duplicates
    const newSelected = pageRepos && [
      ...pageRepos.filter((repoId) => !selected.includes(repoId)),
    ];

    updateSelected([...selected, ...newSelected!]);
  };

  const handleDeselectAll = () => {
    updateSelected([]);
  };

  const getRepoNameByUrl = (url: string) => {
    return data!.data?.find((repo) => repo.url === url)?.name;
  };

  return (
    (isError && <Error />) ||
    (isLoading && <Loading />) ||
    (isSuccess && (
      <>
        {data.data?.length === 0 ? (
          <Empty refetch={refetch} isFetching={isFetching} />
        ) : (
          <>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem variant="bulk-select">
                  <BulkSelect
                    selected={selected}
                    count={data.data?.length}
                    filteredCount={filteredRepositoryURLs?.length}
                    perPage={perPage}
                    handleSelectAll={handleSelectAll}
                    handleSelectPage={handleSelectPage}
                    handleDeselectAll={handleDeselectAll}
                    isDisabled={isFetching}
                  />
                </ToolbarItem>
                <ToolbarItem variant="search-filter">
                  <SearchInput
                    aria-label="Search repositories"
                    onChange={handleFilterRepositories}
                    value={filterValue}
                    onClear={handleClearFilter}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    variant="primary"
                    isInline
                    onClick={() => refetch()}
                    isLoading={isFetching}
                  >
                    {isFetching ? 'Refreshing' : 'Refresh'}
                  </Button>
                </ToolbarItem>
                <ToolbarItem>
                  <ToggleGroup aria-label="Filter repositories list">
                    <ToggleGroupItem
                      text="All"
                      aria-label="All repositories"
                      buttonId="toggle-group-all"
                      isSelected={toggleSelected === 'toggle-group-all'}
                      onChange={handleToggleClick}
                    />
                    <ToggleGroupItem
                      text="Selected"
                      aria-label="Selected repositories"
                      buttonId="toggle-group-selected"
                      isSelected={toggleSelected === 'toggle-group-selected'}
                      onChange={handleToggleClick}
                    />
                  </ToggleGroup>
                </ToolbarItem>
                <ToolbarItem variant="pagination">
                  <Pagination
                    itemCount={
                      filteredRepositoryURLs && filteredRepositoryURLs.length
                    }
                    perPage={perPage}
                    page={page}
                    onSetPage={handleSetPage}
                    onPerPageSelect={handlePerPageSelect}
                    isCompact
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Panel>
              <PanelMain>
                <RepositoryUnavailable />
                <Table variant="compact" data-testid="repositories-table">
                  <Thead>
                    <Tr>
                      <Th />
                      <Th width={45}>Name</Th>
                      <Th width={15}>Architecture</Th>
                      <Th>Version</Th>
                      <Th width={10}>Packages</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRepositoryURLs &&
                      filteredRepositoryURLs
                        .sort((a, b) => {
                          if (getRepoNameByUrl(a!)! < getRepoNameByUrl(b!)!) {
                            return -1;
                          } else if (
                            getRepoNameByUrl(b!)! < getRepoNameByUrl(a!)!
                          ) {
                            return 1;
                          } else {
                            return 0;
                          }
                        })
                        .slice(computeStart(), computeEnd())
                        .map((repoURL, rowIndex) => {
                          const repo = data?.data?.find(
                            (repo) => repo.url === repoURL
                          );

                          if (!repo) {
                            return <></>;
                          }

                          const repoExists = repo.name ? true : false;
                          return (
                            <Tr key={repo.url}>
                              <Td
                                select={{
                                  isSelected: isRepoSelected(repo.url),
                                  rowIndex: rowIndex,
                                  onSelect: (event, isSelecting) =>
                                    handleSelect(
                                      repo.url,
                                      rowIndex,
                                      isSelecting
                                    ),
                                  isDisabled:
                                    isFetching || repo.status !== 'Valid',
                                }}
                              />
                              <Td dataLabel={'Name'}>
                                {repoExists
                                  ? repo.name
                                  : 'Repository with the following url is no longer available:'}
                                <br />
                                <Button
                                  component="a"
                                  target="_blank"
                                  variant="link"
                                  icon={<ExternalLinkAltIcon />}
                                  iconPosition="right"
                                  isInline
                                  href={repo.url}
                                >
                                  {repo.url}
                                </Button>
                              </Td>
                              <Td dataLabel={'Architecture'}>
                                {repoExists ? repo.distribution_arch : '-'}
                              </Td>
                              <Td dataLabel={'Version'}>
                                {repoExists ? repo.distribution_versions : '-'}
                              </Td>
                              <Td dataLabel={'Packages'}>
                                {repoExists ? repo.package_count : '-'}
                              </Td>
                              <Td dataLabel={'Status'}>
                                <RepositoriesStatus
                                  repoStatus={
                                    repoExists ? repo.status : 'Unavailable'
                                  }
                                  repoUrl={repo.url}
                                  repoIntrospections={
                                    repo.last_introspection_time
                                  }
                                  repoFailCount={
                                    repo.failed_introspections_count
                                  }
                                />
                              </Td>
                            </Tr>
                          );
                        })}
                  </Tbody>
                </Table>
              </PanelMain>
            </Panel>
            <Pagination
              itemCount={
                filteredRepositoryURLs && filteredRepositoryURLs.length
              }
              perPage={perPage}
              page={page}
              onSetPage={handleSetPage}
              onPerPageSelect={handlePerPageSelect}
              variant={PaginationVariant.bottom}
            />
          </>
        )}
      </>
    ))
  );
};

const Error = () => {
  return (
    <Alert title="Repositories unavailable" variant="danger" isPlain isInline>
      Repositories cannot be reached, try again later.
    </Alert>
  );
};

const Loading = () => {
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="Loading"
        icon={<EmptyStateIcon icon={Spinner} />}
        headingLevel="h4"
      />
    </EmptyState>
  );
};

type EmptyProps = {
  isFetching: boolean;
  refetch: Function;
};

const Empty = ({ isFetching, refetch }: EmptyProps) => {
  const { isBeta } = useGetEnvironment();
  return (
    <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
      <EmptyStateHeader
        titleText="No Custom Repositories"
        icon={<EmptyStateIcon icon={RepositoryIcon} />}
        headingLevel="h4"
      />
      <EmptyStateBody>
        Repositories can be added in the &quot;Repositories&quot; area of the
        console. Once added, refresh this page to see them.
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant="primary"
          component="a"
          target="_blank"
          href={isBeta() ? '/preview/settings/content' : '/settings/content'}
          className="pf-u-mr-sm"
        >
          Go to repositories
        </Button>
        <Button
          variant="secondary"
          isInline
          onClick={() => refetch()}
          isLoading={isFetching}
        >
          {isFetching ? 'Refreshing' : 'Refresh'}
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default Repositories;
