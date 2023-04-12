import React, { useMemo, useState } from 'react';

import {
  useFieldApi,
  useFormApi,
} from '@data-driven-forms/react-form-renderer';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  SearchInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { RepositoryIcon } from '@patternfly/react-icons';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { selectValidRepositories } from '../../../store/repositoriesSlice';

const BulkSelect = ({
  selected,
  count,
  filteredCount,
  perPage,
  handleSelectAll,
  handleSelectPage,
  handleDeselectAll,
}) => {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  const numSelected = selected.length;
  const allSelected = count !== 0 ? numSelected === count : undefined;
  const anySelected = numSelected > 0;
  const someChecked = anySelected ? null : false;
  const isChecked = allSelected ? true : someChecked;

  const items = [
    <DropdownItem
      key="none"
      onClick={handleDeselectAll}
    >{`Select none (0 items)`}</DropdownItem>,
    <DropdownItem key="page" onClick={handleSelectPage}>{`Select page (${
      perPage > filteredCount ? filteredCount : perPage
    } items)`}</DropdownItem>,
    <DropdownItem
      key="all"
      onClick={handleSelectAll}
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

// Utility function to convert from Content Sources to Image Builder API schema
const convertSchemaToImageBuilder = (repo) => {
  const imageBuilderRepo = {
    baseurl: repo.url,
    rhsm: false,
  };
  if (repo.gpg_key) {
    imageBuilderRepo.gpgkey = repo.gpg_key;
    imageBuilderRepo.check_gpg = true;
    imageBuilderRepo.check_repo_gpg = repo.metadata_verification;
  }

  return imageBuilderRepo;
};

// Utility function to convert from Image Builder to Content Sources API schema
const convertSchemaToContentSources = (repo) => {
  const contentSourcesRepo = {
    url: repo.baseurl,
    rhsm: false,
  };
  if (repo.gpgkey) {
    contentSourcesRepo.gpg_key = repo.gpgkey;
    contentSourcesRepo.metadata_verification = repo.check_repo_gpg;
  }

  return contentSourcesRepo;
};

const Repositories = (props) => {
  const initializeRepositories = () => {
    // Repositories obtained from Content Sources API are in Redux store
    const contentSourcesRepos = useSelector((state) =>
      selectValidRepositories(state)
    );

    // Repositories in the form state can be present when 'Recreate image' is used
    // to open the wizard that are not necessarily in content sources.
    const formStateReposList =
      getState()?.values?.['original-payload-repositories'];

    const mergeRepositories = (contentSourcesRepos, formStateReposList) => {
      const formStateRepos = {};

      for (const repo of formStateReposList) {
        formStateRepos[repo.baseurl] = convertSchemaToContentSources(repo);
        formStateRepos[repo.baseurl].name = '';
      }

      // In case of duplicate repo urls, the repo from Content Sources overwrites the
      // repo from the form state.
      const mergedRepos = { ...formStateRepos, ...contentSourcesRepos };

      return mergedRepos;
    };

    const repositories = formStateReposList
      ? mergeRepositories(contentSourcesRepos, formStateReposList)
      : contentSourcesRepos;

    return repositories;
  };

  const { getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [repositories] = useState(initializeRepositories());
  const [filterValue, setFilterValue] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(
    getState()?.values?.['custom-repositories']
      ? getState().values['custom-repositories'].map((repo) => repo.baseurl)
      : []
  );

  const isRepoSelected = (repoURL) => selected.includes(repoURL);

  const handlePerPageSelect = (event, newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleSetPage = (event, newPage) => {
    setPage(newPage);
  };

  // filter displayed selected packages
  const handleFilterRepositories = (_, value) => {
    setPage(1);
    setFilterValue(value);
  };

  const filteredRepositoryURLs = useMemo(() => {
    const filteredRepoURLs = Object.values(repositories)
      .filter((repo) =>
        repo.name.toLowerCase().includes(filterValue.toLowerCase())
      )
      .map((repo) => repo.url);

    return filteredRepoURLs;
  }, [filterValue]);

  const handleClearFilter = () => {
    setFilterValue('');
  };

  const updateFormState = (selectedRepoURLs) => {
    // repositories is stored as an object with repoURLs as keys
    const selectedRepos = [];
    for (const repoURL of selectedRepoURLs) {
      selectedRepos.push(repositories[repoURL]);
    }

    const payloadRepositories = selectedRepos.map((repo) =>
      convertSchemaToImageBuilder(repo)
    );

    input.onChange(payloadRepositories);
  };

  const updateSelected = (selectedRepos) => {
    setSelected(selectedRepos);
    updateFormState(selectedRepos);
  };

  const handleSelect = (repoURL, rowIndex, isSelecting) => {
    if (isSelecting === true) {
      updateSelected([...selected, repoURL]);
    } else if (isSelecting === false) {
      updateSelected(
        selected.filter((selectedRepoId) => selectedRepoId !== repoURL)
      );
    }
  };

  const handleSelectAll = () => {
    updateSelected(Object.keys(repositories));
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

  const handleSelectPage = () => {
    const pageRepos = filteredRepositoryURLs.slice(
      computeStart(),
      computeEnd()
    );

    // Filter to avoid adding duplicates
    const newSelected = [
      ...pageRepos.filter((repoId) => !selected.includes(repoId)),
    ];

    updateSelected([...selected, ...newSelected]);
  };

  const handleDeselectAll = () => {
    updateSelected([]);
  };

  return (
    <>
      {Object.values(repositories).length === 0 ? (
        <EmptyState variant={EmptyStateVariant.large} data-testid="empty-state">
          <EmptyStateIcon icon={RepositoryIcon} />
          <Title headingLevel="h4" size="lg">
            No Custom Repositories
          </Title>
          <EmptyStateBody>
            Custom repositories managed via the Red Hat Insights Repositories
            app will be available here to select and use to search for
            additional packages.
          </EmptyStateBody>
          <Button
            variant="primary"
            component="a"
            href={
              getState()?.values?.isBeta
                ? '/beta/settings/content'
                : '/settings/content'
            }
          >
            Repositories
          </Button>
        </EmptyState>
      ) : (
        <>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem variant="bulk-select">
                <BulkSelect
                  selected={selected}
                  count={Object.values(repositories).length}
                  filteredCount={filteredRepositoryURLs.length}
                  perPage={perPage}
                  handleSelectAll={handleSelectAll}
                  handleSelectPage={handleSelectPage}
                  handleDeselectAll={handleDeselectAll}
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
              <ToolbarItem variant="pagination">
                <Pagination
                  itemCount={filteredRepositoryURLs.length}
                  perPage={perPage}
                  page={page}
                  onSetPage={handleSetPage}
                  widgetId="compact-example"
                  onPerPageSelect={handlePerPageSelect}
                  isCompact
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <TableComposable variant="compact" data-testid="repositories-table">
            <Thead>
              <Tr>
                <Th />
                <Th width={50}>Name</Th>
                <Th>Architecture</Th>
                <Th>Versions</Th>
                <Th>Packages</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRepositoryURLs
                .slice()
                .sort((a, b) => {
                  if (repositories[a].name < repositories[b].name) {
                    return -1;
                  } else if (repositories[b].name < repositories[a].name) {
                    return 1;
                  } else {
                    return 0;
                  }
                })
                .slice(computeStart(), computeEnd())
                .map((repoURL, rowIndex) => {
                  const repo = repositories[repoURL];
                  return (
                    <Tr key={repo.url}>
                      <Td
                        select={{
                          isSelected: isRepoSelected(repo.url),
                          rowIndex: rowIndex,
                          onSelect: (event, isSelecting) =>
                            handleSelect(repo.url, rowIndex, isSelecting),
                        }}
                      />
                      <Td dataLabel={'Name'}>
                        {repo.name}
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
                        {repo.distribution_arch}
                      </Td>
                      <Td dataLabel={'Version'}>
                        {repo.distribution_versions}
                      </Td>
                      <Td dataLabel={'Packages'}>{repo.package_count}</Td>
                    </Tr>
                  );
                })}
            </Tbody>
          </TableComposable>
        </>
      )}
    </>
  );
};

BulkSelect.propTypes = {
  selected: PropTypes.array,
  count: PropTypes.number,
  filteredCount: PropTypes.number,
  perPage: PropTypes.number,
  handleSelectAll: PropTypes.func,
  handleSelectPage: PropTypes.func,
  handleDeselectAll: PropTypes.func,
};

export default Repositories;
