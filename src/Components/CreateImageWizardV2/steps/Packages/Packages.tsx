import React, { useEffect, useState } from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Icon,
  Pagination,
  SearchInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core/deprecated';
import { CogIcon, SearchIcon, UserIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useDispatch } from 'react-redux';

import { useSearchRpmMutation } from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import {
  Package,
  useGetPackagesQuery,
} from '../../../../store/imageBuilderApi';
import {
  removePackage,
  selectArchitecture,
  selectPackages,
  selectCustomRepositories,
  selectDistribution,
  addPackage,
} from '../../../../store/wizardSlice';

export type IBPackageWithRepositoryInfo = {
  name: Package['name'];
  summary: Package['summary'];
  repository: string;
};

type BulkSelectProps = {
  selected: Package[];
  count: number | undefined;
  perPage: number;
  packagesCount: number | undefined;
  handleSelectAll: Function;
  handleSelectPage: Function;
  handleDeselectAll: Function;
};

const BulkSelect = ({
  selected,
  count,
  perPage,
  packagesCount,
  handleSelectAll,
  handleSelectPage,
  handleDeselectAll,
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
      perPage > packagesCount! ? packagesCount : perPage
    } items)`}</DropdownItem>,
    <DropdownItem key="all" onClick={() => handleSelectAll()}>{`Select all (${
      packagesCount || 0
    } items)`}</DropdownItem>,
  ];

  const handleDropdownSelect = () => toggleDropdown();

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

const EmptySearch = () => {
  return (
    <Tr>
      <Td colSpan={4}>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.sm}>
            <EmptyStateHeader icon={<EmptyStateIcon icon={SearchIcon} />} />
            <EmptyStateBody>
              Search above to add additional
              <br />
              packages to your image
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
};

const NoResultsFound = () => {
  return (
    <Tr>
      <Td colSpan={4}>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.sm}>
            <EmptyStateHeader titleText="No results found" headingLevel="h4" />
            <EmptyStateBody>Adjust your search and try again</EmptyStateBody>
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
};

const TooManyResults = () => {
  return (
    <Tr>
      <Td colSpan={4}>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.sm}>
            <EmptyStateHeader
              titleText="Too many results to display"
              headingLevel="h4"
            />
            <EmptyStateBody>
              Please make the search more specific and try again
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
};

const Packages = () => {
  const dispatch = useDispatch();

  const arch = useAppSelector((state) => selectArchitecture(state));
  const distribution = useAppSelector((state) => selectDistribution(state));
  const customRepositories = useAppSelector((state) =>
    selectCustomRepositories(state)
  );
  const packages = useAppSelector((state) => selectPackages(state));

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [toggleSelected, setToggleSelected] = useState('toggle-available');

  /*FOLLOW UP
  const [toggleSourceRepos, setToggleSourceRepos] = useState(
    'toggle-included-repos'
  );
  */

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [
    searchRpms,
    { data: dataCustomPackages, isSuccess: isSuccessCustomPackages },
  ] = useSearchRpmMutation();

  const { data: dataDistroPackages, isSuccess: isSuccessDistroPackages } =
    useGetPackagesQuery(
      {
        distribution: distribution,
        architecture: arch,
        search: searchTerm,
      },
      { skip: !searchTerm }
    );

  useEffect(() => {
    const fetchCustomPackages = async () => {
      await searchRpms({
        apiContentUnitSearchRequest: {
          search: searchTerm,
          urls: customRepositories.flatMap((repo) => {
            if (!repo.baseurl) {
              throw new Error(
                `Repository (id: ${repo.id}, name: ${repo?.name}) is missing baseurl`
              );
            }
            return repo.baseurl;
          }),
        },
      });
    };

    fetchCustomPackages();
  }, [customRepositories, searchRpms, searchTerm]);

  const transformPackageData = () => {
    let transformedDistroData: IBPackageWithRepositoryInfo[] = [];
    let transformedCustomData: IBPackageWithRepositoryInfo[] = [];

    if (isSuccessDistroPackages) {
      transformedDistroData = dataDistroPackages.data.map((values) => ({
        ...values,
        repository: 'distro',
      }));
    }

    if (isSuccessCustomPackages) {
      transformedCustomData = dataCustomPackages!.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'custom',
      }));
    }

    const combinedPackageData = transformedDistroData.concat(
      transformedCustomData
    );

    if (toggleSelected === 'toggle-available') {
      return combinedPackageData;
    } else {
      const selectedPackages = [...packages];
      return selectedPackages;
    }
  };

  // Get and sort the list of packages including repository info
  const transformedPackages = transformPackageData().sort((a, b) => {
    const aPkg = a.name.toLowerCase();
    const bPkg = b.name.toLowerCase();
    // check exact match first
    if (aPkg === searchTerm) {
      return -1;
    }
    if (bPkg === searchTerm) {
      return 1;
    }
    // check for packages that start with the search term
    if (aPkg.startsWith(searchTerm) && !bPkg.startsWith(searchTerm)) {
      return -1;
    }
    if (bPkg.startsWith(searchTerm) && !aPkg.startsWith(searchTerm)) {
      return 1;
    }
    // if both (or neither) start with the search term
    // sort alphabetically
    if (aPkg < bPkg) {
      return -1;
    }
    if (bPkg < aPkg) {
      return 1;
    }
    return 0;
  });

  const handleSearch = async (
    event: React.FormEvent<HTMLInputElement>,
    selection: string
  ) => {
    setSearchTerm(selection);
  };

  const handleSelect = (
    pkg: IBPackageWithRepositoryInfo,
    _: number,
    isSelecting: boolean
  ) => {
    if (isSelecting) {
      dispatch(addPackage(pkg));
    } else {
      dispatch(removePackage(pkg));
    }
  };

  const handleSelectAll = () => {
    for (const pkgIndex in transformedPackages) {
      dispatch(addPackage(transformedPackages[pkgIndex]));
    }
  };

  const handleSelectPage = () => {
    const packagesSlice = transformedPackages.slice(
      computeStart(),
      computeEnd()
    );
    for (const pkgIndex in packagesSlice) {
      if (!packages.some((p) => p.name === packagesSlice[pkgIndex].name)) {
        dispatch(addPackage(packagesSlice[pkgIndex]));
      }
    }
  };

  const handleDeselectAll = () => {
    for (const pkgIndex in packages) {
      dispatch(removePackage(packages[pkgIndex]));
    }
  };

  const handleFilterToggleClick = (event: React.MouseEvent) => {
    const id = event.currentTarget.id;
    setPage(1);
    setToggleSelected(id);
  };

  /*FOLLOW UP
  const handleRepoToggleClick = (event: React.MouseEvent) => {
    const id = event.currentTarget.id;
    setPage(1);
    setToggleSourceRepos(id);
  };
  */

  const handleSetPage = (_: React.MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (
    _: React.MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

  const handleExactMatch = () => {
    const exactMatch = transformedPackages.find(
      (pkg) => pkg.name === searchTerm
    );

    if (exactMatch) {
      return (
        <>
          <Tr key={`${exactMatch.name}`} data-testid="exact-match-row">
            <Td
              select={{
                isSelected: packages.some((p) => p.name === exactMatch.name),
                rowIndex: 0,
                onSelect: (event, isSelecting) =>
                  handleSelect(exactMatch, 0, isSelecting),
              }}
            />
            <Td>{exactMatch.name}</Td>
            <Td>{exactMatch.summary}</Td>
            {exactMatch.repository === 'distro' ? (
              <>
                <Td>
                  <Icon status="danger">
                    <UserIcon />
                  </Icon>{' '}
                  Red Hat repository
                </Td>
                <Td>Supported</Td>
              </>
            ) : (
              <>
                <Td>
                  <Icon>
                    <CogIcon />
                  </Icon>{' '}
                  Custom repository
                </Td>
                <Td>Not supported</Td>
              </>
            )}
          </Tr>
          <TooManyResults />
        </>
      );
    } else {
      return <TooManyResults />;
    }
  };

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant="bulk-select">
            <BulkSelect
              selected={packages}
              count={packages.length}
              perPage={perPage}
              packagesCount={transformedPackages.length}
              handleSelectAll={handleSelectAll}
              handleSelectPage={handleSelectPage}
              handleDeselectAll={handleDeselectAll}
            />
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
            <SearchInput
              aria-label="Search packages"
              value={searchTerm}
              onChange={handleSearch}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary" isInline>
              Refresh
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <ToggleGroup>
              <ToggleGroupItem
                text="Available"
                buttonId="toggle-available"
                isSelected={toggleSelected === 'toggle-available'}
                onChange={handleFilterToggleClick}
              />
              <ToggleGroupItem
                text="Selected"
                buttonId="toggle-selected"
                isSelected={toggleSelected === 'toggle-selected'}
                onChange={handleFilterToggleClick}
              />
            </ToggleGroup>
          </ToolbarItem>
          {/*FOLLOW UP
          <ToolbarItem>
            {' '}
            <ToggleGroup>
              <ToggleGroupItem
                text="Included repos"
                buttonId="toggle-included-repos"
                isSelected={toggleSourceRepos === 'toggle-included-repos'}
                onChange={handleRepoToggleClick}
              />
              <ToggleGroupItem
                text="All repos"
                buttonId="toggle-all-repos"
                isSelected={toggleSourceRepos === 'toggle-all-repos'}
                onChange={handleRepoToggleClick}
              />
            </ToggleGroup>
          </ToolbarItem>
          */}
          <ToolbarItem variant="pagination">
            <Pagination
              itemCount={transformedPackages.length}
              perPage={perPage}
              page={page}
              onSetPage={handleSetPage}
              onPerPageSelect={handlePerPageSelect}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table variant="compact" data-testid="packages-table">
        <Thead>
          <Tr>
            <Th />
            <Th width={20}>Package name</Th>
            <Th width={35}>Description</Th>
            <Th width={25}>Package repository</Th>
            <Th width={20}>Support</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!searchTerm && toggleSelected === 'toggle-available' && (
            <EmptySearch />
          )}
          {searchTerm && transformedPackages.length === 0 && <NoResultsFound />}
          {searchTerm &&
            transformedPackages.length >= 100 &&
            handleExactMatch()}
          {transformedPackages.length < 100 &&
            transformedPackages
              .slice(computeStart(), computeEnd())
              .map((pkg, rowIndex) => (
                <Tr key={`${pkg.name}-${rowIndex}`} data-testid="package-row">
                  <Td
                    select={{
                      isSelected: packages.some((p) => p.name === pkg.name),
                      rowIndex: rowIndex,
                      onSelect: (event, isSelecting) =>
                        handleSelect(pkg, rowIndex, isSelecting),
                    }}
                  />
                  <Td>{pkg.name}</Td>
                  <Td>{pkg.summary}</Td>
                  {pkg.repository === 'distro' ? (
                    <>
                      <Td>
                        <Icon status="danger">
                          <UserIcon />
                        </Icon>{' '}
                        Red Hat repository
                      </Td>
                      <Td>Supported</Td>
                    </>
                  ) : (
                    <>
                      <Td>
                        <Icon>
                          <CogIcon />
                        </Icon>{' '}
                        Custom repository
                      </Td>
                      <Td>Not supported</Td>
                    </>
                  )}
                </Tr>
              ))}
        </Tbody>
      </Table>
      <Pagination
        itemCount={transformedPackages.length}
        perPage={perPage}
        page={page}
        onSetPage={handleSetPage}
        onPerPageSelect={handlePerPageSelect}
        isCompact
      />
    </>
  );
};

export default Packages;
