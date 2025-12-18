import React, { ReactElement, useEffect, useMemo, useState } from 'react';

import {
  Bullseye,
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Icon,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  PaginationVariant,
  Popover,
  SearchInput,
  Spinner,
  Stack,
  Tab,
  Tabs,
  TabTitleText,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  HelpIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { orderBy } from 'lodash';
import { useDispatch } from 'react-redux';

import CustomHelperText from './components/CustomHelperText';
import PackageInfoNotAvailablePopover from './components/PackageInfoNotAvailablePopover';
import {
  IncludedReposPopover,
  OtherReposPopover,
} from './components/RepoPopovers';

import {
  CONTENT_URL,
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '../../../../constants';
import { useIsOnPremise } from '../../../../Hooks';
import { useGetArchitecturesQuery } from '../../../../store/backendApi';
import {
  ApiRepositoryResponseRead,
  ApiSearchRpmResponse,
  useCreateRepositoryMutation,
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRpmMutation,
} from '../../../../store/contentSourcesApi';
import { useAppSelector } from '../../../../store/hooks';
import { Package } from '../../../../store/imageBuilderApi';
import {
  addModule,
  addPackage,
  addPackageGroup,
  addRecommendedRepository,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectGroups,
  selectModules,
  selectPackages,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
} from '../../../../store/wizardSlice';
import {
  getEpelDefinitionForDistribution,
  getEpelUrlForDistribution,
  getEpelVersionForDistribution,
} from '../../../../Utilities/epel';
import { convertStringToDate } from '../../../../Utilities/time';
import useDebounce from '../../../../Utilities/useDebounce';

export type PackageRepository = 'distro' | 'custom' | 'recommended' | '';

export type ItemWithSources = {
  name: Package['name'];
  summary: Package['summary'];
  repository: PackageRepository;
  sources?: ApiSearchRpmResponse['package_sources'];
};

export type IBPackageWithRepositoryInfo = {
  name: Package['name'];
  summary: Package['summary'];
  repository: PackageRepository;
  type?: string;
  module_name?: string;
  stream?: string;
  end_date?: string;
};

export type GroupWithRepositoryInfo = {
  name: string;
  description: string;
  repository: PackageRepository;
  package_list: string[];
};

export enum Repos {
  INCLUDED = 'included-repos',
  OTHER = 'other-repos',
}

const Packages = () => {
  const dispatch = useDispatch();

  const isOnPremise = useIsOnPremise();
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const modules = useAppSelector(selectModules);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);

  const { data: templateData } = useGetTemplateQuery({
    uuid: template,
  });

  const {
    data: { data: reposInTemplate = [] } = {},
    isLoading: isLoadingReposInTemplate,
  } = useListRepositoriesQuery({
    contentType: 'rpm',
    limit: 100,
    offset: 0,
    uuid:
      templateData && templateData.repository_uuids
        ? templateData.repository_uuids.join(',')
        : '',
  });

  const { data: distroRepositories, isSuccess: isSuccessDistroRepositories } =
    useGetArchitecturesQuery({
      distribution: distribution,
    });

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.EXTERNAL,
    });

  const [currentlyRemovedPackages, setCurrentlyRemovedPackages] = useState<
    IBPackageWithRepositoryInfo[]
  >([]);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [toggleSelected, setToggleSelected] = useState('toggle-available');
  const [activeTabKey, setActiveTabKey] = useState(Repos.INCLUDED);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeStream, setActiveStream] = useState<string>('');
  const [
    searchCustomRpms,
    {
      data: dataCustomPackages,
      isSuccess: isSuccessCustomPackages,
      isLoading: isLoadingCustomPackages,
    },
  ] = useSearchRpmMutation();

  const debouncedSearchTerm = useDebounce(searchTerm.trim());
  const debouncedSearchTermLengthOf1 = debouncedSearchTerm.length === 1;
  const debouncedSearchTermIsGroup = debouncedSearchTerm.startsWith('@');

  // While it's searching for packages or groups, only show either packages or groups, without mixing the two.
  const showPackages =
    (debouncedSearchTerm && !debouncedSearchTermIsGroup) ||
    toggleSelected === 'toggle-selected';
  const showGroups =
    (debouncedSearchTerm && debouncedSearchTermIsGroup) ||
    toggleSelected === 'toggle-selected';

  const [
    searchRecommendedRpms,
    {
      data: dataRecommendedPackages,
      isSuccess: isSuccessRecommendedPackages,
      isLoading: isLoadingRecommendedPackages,
    },
  ] = useSearchRpmMutation();

  const [
    searchDistroRpms,
    {
      data: dataDistroPackages,
      isSuccess: isSuccessDistroPackages,
      isLoading: isLoadingDistroPackages,
    },
  ] = useSearchRpmMutation();

  const [
    searchDistroGroups,
    {
      data: dataDistroGroups,
      isSuccess: isSuccessDistroGroups,
      isLoading: isLoadingDistroGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchCustomGroups,
    {
      data: dataCustomGroups,
      isSuccess: isSuccessCustomGroups,
      isLoading: isLoadingCustomGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [
    searchRecommendedGroups,
    {
      data: dataRecommendedGroups,
      isSuccess: isSuccessRecommendedGroups,
      isLoading: isLoadingRecommendedGroups,
    },
  ] = useSearchPackageGroupMutation();

  const [createRepository, { isLoading: createLoading }] =
    useCreateRepositoryMutation();

  useEffect(() => {
    if (debouncedSearchTermIsGroup) {
      return;
    }
    if (debouncedSearchTerm.length > 1 && isSuccessDistroRepositories) {
      if (isOnPremise) {
        searchDistroRpms({
          apiContentUnitSearchRequest: {
            packages: [debouncedSearchTerm],
            architecture: arch,
            distribution,
          },
        });
      } else {
        searchDistroRpms({
          apiContentUnitSearchRequest: {
            search: debouncedSearchTerm,
            urls:
              template === ''
                ? distroRepositories
                    .filter((archItem) => {
                      return archItem.arch === arch;
                    })[0]
                    .repositories.flatMap((repo) => {
                      if (!repo.baseurl) {
                        throw new Error(`Repository ${repo} missing baseurl`);
                      }
                      return repo.baseurl;
                    })
                : reposInTemplate
                    .filter((r) => r.org_id === '-1' && !!r.url)
                    .flatMap((r) =>
                      r.url!.endsWith('/') ? r.url!.slice(0, -1) : r.url!,
                    ),
            limit: 500,
            include_package_sources: true,
            date: snapshotDate
              ? new Date(convertStringToDate(snapshotDate)).toISOString()
              : undefined,
          },
        });
      }
    }
    if (debouncedSearchTerm.length > 2) {
      if (activeTabKey === Repos.INCLUDED && customRepositories.length > 0) {
        searchCustomRpms({
          apiContentUnitSearchRequest: {
            search: debouncedSearchTerm,
            uuids: customRepositories.flatMap((repo) => {
              return repo.id;
            }),
            limit: 500,
            include_package_sources: true,
            date: snapshotDate
              ? new Date(convertStringToDate(snapshotDate)).toISOString()
              : undefined,
          },
        });
      } else {
        searchRecommendedRpms({
          apiContentUnitSearchRequest: {
            search: debouncedSearchTerm,
            urls: [epelRepoUrlByDistribution],
            date: snapshotDate
              ? new Date(convertStringToDate(snapshotDate)).toISOString()
              : undefined,
          },
        });
      }
    }
  }, [
    customRepositories,
    searchCustomRpms,
    searchDistroRpms,
    debouncedSearchTerm,
    activeTabKey,
    searchRecommendedRpms,
    epelRepoUrlByDistribution,
    isSuccessDistroRepositories,
    distroRepositories,
    arch,
    template,
    distribution,
    debouncedSearchTermIsGroup,
    snapshotDate,
  ]);

  useEffect(() => {
    if (!debouncedSearchTermIsGroup) {
      return;
    }
    if (isSuccessDistroRepositories) {
      searchDistroGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
          urls: distroRepositories
            .filter((archItem) => {
              return archItem.arch === arch;
            })[0]
            .repositories.flatMap((repo) => {
              if (!repo.baseurl) {
                throw new Error(`Repository ${repo} missing baseurl`);
              }
              return repo.baseurl;
            }),
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (activeTabKey === Repos.INCLUDED && customRepositories.length > 0) {
      searchCustomGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
          uuids: customRepositories.flatMap((repo) => {
            return repo.id;
          }),
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    } else if (activeTabKey === Repos.OTHER && isSuccessEpelRepo) {
      searchRecommendedGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
          urls: [epelRepoUrlByDistribution],
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
  }, [
    customRepositories,
    searchDistroGroups,
    searchCustomGroups,
    searchRecommendedGroups,
    debouncedSearchTerm,
    activeTabKey,
    epelRepoUrlByDistribution,
    debouncedSearchTermIsGroup,
    arch,
    distroRepositories,
    isSuccessDistroRepositories,
    isSuccessEpelRepo,
    snapshotDate,
  ]);

  const EmptySearch = () => {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState icon={SearchIcon} variant={EmptyStateVariant.sm}>
                {toggleSelected === 'toggle-available' ? (
                  <EmptyStateBody>
                    Search above to add additional
                    <br />
                    packages to your image.
                  </EmptyStateBody>
                ) : (
                  <EmptyStateBody>
                    No packages selected.
                    <br />
                    Search above to see available packages.
                  </EmptyStateBody>
                )}
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  };

  const Searching = () => {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState icon={Spinner} variant={EmptyStateVariant.sm}>
                <EmptyStateBody>
                  {activeTabKey === Repos.OTHER
                    ? 'Searching for recommendations'
                    : 'Searching'}
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  };

  const TooShort = () => {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState
                headingLevel='h4'
                icon={SearchIcon}
                titleText='The search value is too short'
                variant={EmptyStateVariant.sm}
              >
                <EmptyStateBody>
                  Please make the search more specific and try again.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  };

  const TryLookingUnderIncluded = () => {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={5}>
            <Bullseye>
              <EmptyState
                headingLevel='h4'
                titleText='No selected packages in Other repos'
                variant={EmptyStateVariant.sm}
              >
                <EmptyStateBody>
                  Try looking under &quot;
                  <Button
                    variant='link'
                    onClick={() => setActiveTabKey(Repos.INCLUDED)}
                    isInline
                  >
                    Included repos
                  </Button>
                  &quot;.
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  };

  const NoResultsFound = ({ isOnPremise }: { isOnPremise: boolean }) => {
    if (activeTabKey === Repos.INCLUDED) {
      return (
        <Tbody>
          <Tr>
            <Td colSpan={5}>
              <Bullseye>
                <EmptyState
                  headingLevel='h4'
                  titleText='No results found'
                  icon={SearchIcon}
                  variant={EmptyStateVariant.sm}
                >
                  {!isOnPremise && (
                    <EmptyStateBody>
                      Adjust your search and try again, or search in other
                      repositories (your repositories and popular repositories).
                    </EmptyStateBody>
                  )}
                  {isOnPremise && (
                    <EmptyStateBody>
                      Adjust your search and try again.
                    </EmptyStateBody>
                  )}
                  <EmptyStateFooter>
                    <EmptyStateActions>
                      {!isOnPremise && (
                        <Button
                          variant='primary'
                          onClick={() => setActiveTabKey(Repos.OTHER)}
                        >
                          Search other repositories
                        </Button>
                      )}
                    </EmptyStateActions>
                    {!isOnPremise && (
                      <EmptyStateActions>
                        <Button
                          className='pf-v6-u-pt-md'
                          variant='link'
                          isInline
                          component='a'
                          target='_blank'
                          iconPosition='right'
                          icon={<ExternalLinkAltIcon />}
                          href={CONTENT_URL}
                        >
                          Manage your repositories and popular repositories
                        </Button>
                      </EmptyStateActions>
                    )}
                  </EmptyStateFooter>
                </EmptyState>
              </Bullseye>
            </Td>
          </Tr>
        </Tbody>
      );
    } else {
      return (
        <Tbody>
          <Tr>
            <Td colSpan={5}>
              <Bullseye>
                <EmptyState
                  headingLevel='h4'
                  titleText='No results found'
                  icon={SearchIcon}
                  variant={EmptyStateVariant.sm}
                >
                  <EmptyStateBody>
                    No packages found in known repositories. If you know of a
                    repository containing this packages, add it to{' '}
                    <Button
                      variant='link'
                      isInline
                      component='a'
                      target='_blank'
                      href={CONTENT_URL}
                    >
                      your repositories
                    </Button>{' '}
                    and try searching for it again.
                  </EmptyStateBody>
                </EmptyState>
              </Bullseye>
            </Td>
          </Tr>
        </Tbody>
      );
    }
  };

  const RepositoryModal = () => {
    return (
      <Modal
        isOpen={isRepoModalOpen}
        onClose={handleCloseModalToggle}
        width='50%'
      >
        <ModalHeader
          title='Custom repositories will be added to your image'
          titleIconVariant='warning'
        />
        <ModalBody>
          You have selected packages that belong to custom repositories. By
          continuing, you are acknowledging and consenting to adding the
          following custom repositories to your image.
          <br />
          <br />
          The repositories will also get enabled in{' '}
          <Button
            component='a'
            target='_blank'
            variant='link'
            iconPosition='right'
            isInline
            icon={<ExternalLinkAltIcon />}
            href={CONTENT_URL}
          >
            content services
          </Button>{' '}
          if they were not enabled yet:
          <br />
          <Table variant='compact'>
            <Thead>
              <Tr>
                {isSelectingPackage ? (
                  <Th>Packages</Th>
                ) : (
                  <Th>Package groups</Th>
                )}
                <Th>Repositories</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                {isSelectingPackage ? (
                  <Td>{isSelectingPackage.name}</Td>
                ) : (
                  <Td>{isSelectingGroup?.name}</Td>
                )}
                <Td>
                  EPEL {getEpelVersionForDistribution(distribution)} Everything
                  x86_64
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <br />
          To move forward, either add the repos to your image, or go back to
          review your package selections.
        </ModalBody>
        <ModalFooter>
          <Button
            key='add'
            variant='primary'
            isLoading={createLoading}
            isDisabled={createLoading}
            onClick={handleConfirmModalToggle}
          >
            Add listed repositories
          </Button>
          <Button key='back' variant='link' onClick={handleCloseModalToggle}>
            Back
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  const transformedPackages = useMemo(() => {
    let transformedDistroData: ItemWithSources[] = [];
    let transformedCustomData: ItemWithSources[] = [];
    let transformedRecommendedData: ItemWithSources[] = [];

    if (isSuccessDistroPackages) {
      transformedDistroData = dataDistroPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'distro',
        sources: values.package_sources,
      }));
    }

    if (isSuccessCustomPackages) {
      transformedCustomData = dataCustomPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'custom',
        sources: values.package_sources,
      }));
    }

    let combinedPackageData = transformedDistroData.concat(
      transformedCustomData,
    );

    if (
      debouncedSearchTerm !== '' &&
      combinedPackageData.length === 0 &&
      isSuccessRecommendedPackages &&
      activeTabKey === Repos.OTHER
    ) {
      transformedRecommendedData = dataRecommendedPackages!.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'recommended',
        sources: values.package_sources,
      }));

      combinedPackageData = combinedPackageData.concat(
        transformedRecommendedData,
      );
    }

    let unpackedData: IBPackageWithRepositoryInfo[] =
      combinedPackageData.flatMap((item) => {
        // Spread modules into separate rows by application stream
        if (item.sources) {
          return item.sources.map((source) => ({
            name: item.name,
            summary: item.summary,
            repository: item.repository,
            type: source.type,
            module_name: source.name,
            stream: source.stream,
            end_date: source.end_date,
          }));
        }
        return [
          {
            name: item.name,
            summary: item.summary,
            repository: item.repository,
          },
        ];
      });

    // group by name, but sort by application stream in descending order
    unpackedData = orderBy(
      unpackedData,
      [
        'name',
        (pkg) => pkg.stream || '',
        (pkg) => pkg.repository || '',
        (pkg) => pkg.module_name || '',
      ],
      ['asc', 'desc', 'asc', 'asc'],
    );

    if (toggleSelected === 'toggle-available') {
      if (activeTabKey === Repos.INCLUDED) {
        return unpackedData.filter((pkg) => pkg.repository !== 'recommended');
      }
      return unpackedData.filter((pkg) => pkg.repository === 'recommended');
    } else {
      const selectedPackages = [...packages];
      if (currentlyRemovedPackages.length > 0) {
        selectedPackages.push(...currentlyRemovedPackages);
      }
      if (activeTabKey === Repos.INCLUDED) {
        return selectedPackages;
      } else {
        return [];
      }
    }
  }, [
    currentlyRemovedPackages,
    dataCustomPackages,
    dataDistroPackages,
    dataRecommendedPackages,
    debouncedSearchTerm,
    isSuccessCustomPackages,
    isSuccessDistroPackages,
    isSuccessRecommendedPackages,
    packages,
    toggleSelected,
    activeTabKey,
  ]);

  const transformedGroups = useMemo(() => {
    let combinedGroupData: GroupWithRepositoryInfo[] = [];

    if (isSuccessDistroGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataDistroGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'distro',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessCustomGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataCustomGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'custom',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessRecommendedGroups) {
      combinedGroupData = combinedGroupData.concat(
        dataRecommendedGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'recommended',
          package_list: values.package_list!,
        })),
      );
    }

    if (toggleSelected === 'toggle-available') {
      if (activeTabKey === Repos.INCLUDED) {
        return combinedGroupData.filter(
          (pkg) => pkg.repository !== 'recommended',
        );
      } else {
        return combinedGroupData.filter(
          (pkg) => pkg.repository === 'recommended',
        );
      }
    } else {
      const selectedGroups = [...groups];
      if (activeTabKey === Repos.INCLUDED) {
        return selectedGroups;
      } else {
        return [];
      }
    }
  }, [
    dataDistroGroups,
    dataCustomGroups,
    dataRecommendedGroups,
    debouncedSearchTerm,
    isSuccessDistroGroups,
    isSuccessCustomGroups,
    isSuccessRecommendedGroups,
    groups,
    toggleSelected,
    activeTabKey,
  ]);

  const handleSearch = async (
    event: React.FormEvent<HTMLInputElement>,
    selection: string,
  ) => {
    setSearchTerm(selection);
    setActiveTabKey(Repos.INCLUDED);
    setToggleSelected('toggle-available');
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
    setPage(1);
  };

  const handleClear = async () => {
    setSearchTerm('');
    setActiveTabKey(Repos.INCLUDED);
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
  };

  const handleSelect = (
    pkg: IBPackageWithRepositoryInfo,
    _: number,
    isSelecting: boolean,
  ) => {
    if (isSelecting) {
      if (
        isSuccessEpelRepo &&
        epelRepo.data &&
        pkg.repository === 'recommended' &&
        !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
      ) {
        setIsRepoModalOpen(true);
        setIsSelectingPackage(pkg);
      } else {
        dispatch(addPackage(pkg));
        if (pkg.type === 'module') {
          setActiveStream(pkg.stream || '');
          dispatch(
            addModule({
              name: pkg.module_name || '',
              stream: pkg.stream || '',
            }),
          );
        }
        setCurrentlyRemovedPackages((prev) =>
          prev.filter((curr) => curr.name !== pkg.name),
        );
      }
    } else {
      dispatch(removePackage(pkg.name));
      if (pkg.type === 'module' && pkg.module_name) {
        dispatch(removeModule(pkg.module_name));
      }
      setCurrentlyRemovedPackages((last) => [...last, pkg]);
      if (
        isSuccessEpelRepo &&
        epelRepo.data &&
        packages.filter((pkg) => pkg.repository === 'recommended').length ===
          1 &&
        groups.filter((grp) => grp.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const handleGroupSelect = (
    grp: GroupWithRepositoryInfo,
    _: number,
    isSelecting: boolean,
  ) => {
    if (isSelecting) {
      if (
        isSuccessEpelRepo &&
        epelRepo.data &&
        grp.repository === 'recommended' &&
        !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
      ) {
        setIsRepoModalOpen(true);
        setIsSelectingGroup(grp);
      } else {
        dispatch(addPackageGroup(grp));
      }
    } else {
      dispatch(removePackageGroup(grp.name));
      if (
        isSuccessEpelRepo &&
        epelRepo.data &&
        groups.filter((grp) => grp.repository === 'recommended').length === 1 &&
        packages.filter((pkg) => pkg.repository === 'recommended').length === 0
      ) {
        dispatch(removeRecommendedRepository(epelRepo.data[0]));
      }
    }
  };

  const handleFilterToggleClick = (
    event:
      | MouseEvent
      | React.KeyboardEvent<Element>
      | React.MouseEvent<HTMLElement, MouseEvent>,
    _selected: boolean,
  ) => {
    const id = (event.currentTarget as HTMLElement).id;
    setCurrentlyRemovedPackages([]);
    setPage(1);
    setToggleSelected(id);
  };

  const handleSetPage = (
    _:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (
    _:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const computeStart = () => perPage * (page - 1);
  const computeEnd = () => perPage * page;

  const handleCloseModalToggle = () => {
    setIsRepoModalOpen(!isRepoModalOpen);
    setIsSelectingPackage(undefined);
  };

  const handleConfirmModalToggle = async () => {
    if (!epelRepo || !epelRepo.data) {
      throw new Error(
        `There was an error while adding the recommended repository.`,
      );
    }

    if (epelRepo.data.length === 0) {
      const result = await createRepository({
        apiRepositoryRequest:
          getEpelDefinitionForDistribution(distribution) ??
          EPEL_10_REPO_DEFINITION,
      });
      dispatch(
        addRecommendedRepository(
          (result as { data: ApiRepositoryResponseRead }).data,
        ),
      );
    } else {
      dispatch(addRecommendedRepository(epelRepo.data[0]));
    }
    if (isSelectingPackage) {
      dispatch(addPackage(isSelectingPackage!));
    }
    if (isSelectingGroup) {
      dispatch(addPackageGroup(isSelectingGroup!));
    }
    setIsRepoModalOpen(!isRepoModalOpen);
  };

  const handleTabClick = (
    event?: React.MouseEvent,
    tabIndex?: string | number,
  ) => {
    if (tabIndex === undefined) return;
    if (tabIndex !== activeTabKey) {
      setCurrentlyRemovedPackages([]);
      setPage(1);
      setActiveTabKey(tabIndex as Repos);
    }
  };

  const getPackageUniqueKey = (pkg: IBPackageWithRepositoryInfo): string => {
    try {
      if (!pkg.name) {
        return `invalid_${Date.now()}`;
      }
      return `${pkg.name}_${pkg.stream || 'none'}_${pkg.module_name || 'none'}_${pkg.repository || 'unknown'}`;
    } catch {
      return `error_${Date.now()}`;
    }
  };

  const initialExpandedPkgs: string[] = [];
  const [expandedPkgs, setExpandedPkgs] = useState(initialExpandedPkgs);

  const setPkgExpanded = (
    pkg: IBPackageWithRepositoryInfo,
    isExpanding: boolean,
  ) =>
    setExpandedPkgs((prevExpanded) => {
      const pkgKey = getPackageUniqueKey(pkg);
      const otherExpandedPkgs = prevExpanded.filter((key) => key !== pkgKey);
      return isExpanding ? [...otherExpandedPkgs, pkgKey] : otherExpandedPkgs;
    });

  const isPkgExpanded = (pkg: IBPackageWithRepositoryInfo) =>
    expandedPkgs.includes(getPackageUniqueKey(pkg));

  const initialExpandedGroups: GroupWithRepositoryInfo['name'][] = [];
  const [expandedGroups, setExpandedGroups] = useState(initialExpandedGroups);

  const setGroupsExpanded = (
    group: GroupWithRepositoryInfo['name'],
    isExpanding: boolean,
  ) =>
    setExpandedGroups((prevExpanded) => {
      const otherExpandedGroups = prevExpanded.filter((g) => g !== group);
      return isExpanding
        ? [...otherExpandedGroups, group]
        : otherExpandedGroups;
    });

  const isGroupExpanded = (group: GroupWithRepositoryInfo['name']) =>
    expandedGroups.includes(group);

  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<
    'asc' | 'desc'
  >('asc');

  const sortedPackages = useMemo(() => {
    if (transformedPackages.length < 1 || !Array.isArray(transformedPackages)) {
      return [];
    }

    return orderBy(
      transformedPackages,
      [
        // Active stream packages first (if activeStream is set)
        (pkg) => (activeStream && pkg.stream === activeStream ? 0 : 1),
        // Then by name
        'name',
        // Then by stream version (descending)
        (pkg) => {
          if (!pkg.stream) return '';
          const parts = pkg.stream
            .split('.')
            .map((part) => parseInt(part, 10) || 0);
          // Convert to string with zero-padding for proper sorting
          return parts.map((p) => p.toString().padStart(10, '0')).join('.');
        },
        // Then by end date (nulls last)
        (pkg) => pkg.end_date || '9999-12-31',
        // Then by repository
        (pkg) => pkg.repository || '',
        // Finally by module name
        (pkg) => pkg.module_name || '',
      ],
      ['asc', 'asc', 'desc', 'asc', 'asc', 'asc'],
    );
  }, [transformedPackages, activeStream]);

  const getSortParams = (columnIndex: number) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (
      _event: React.MouseEvent,
      index: number,
      direction: 'asc' | 'desc',
    ) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const isPackageSelected = (pkg: IBPackageWithRepositoryInfo) => {
    let isSelected = false;

    if (!pkg.type || pkg.type === 'package') {
      const isModuleWithSameName = modules.some(
        (module) => module.name === pkg.name,
      );
      isSelected =
        packages.some((p) => p.name === pkg.name && p.stream === pkg.stream) &&
        !isModuleWithSameName;
    }

    if (pkg.type === 'module') {
      // the package is selected if its module stream matches one in enabled_modules
      isSelected =
        packages.some((p) => p.name === pkg.name && p.stream === pkg.stream) &&
        modules.some(
          (m) => m.name === pkg.module_name && m.stream === pkg.stream,
        );
    }

    return isSelected;
  };

  /**
   * Determines if the package's (or group's) select is disabled.
   *
   * Select should be disabled:
   * - if the item is a module
   * - and the module is added to enabled_modules
   * - but the stream doesn't match the stream in enabled_modules
   *
   * @param pkg Package
   * @returns Package (or group) is / is not selected
   */
  const isSelectDisabled = (pkg: IBPackageWithRepositoryInfo) => {
    const isModuleDisabledByPackage =
      pkg.type === 'module' &&
      packages.some(
        (p) => (!p.type || p.type === 'package') && p.name === pkg.module_name,
      );

    const isPackageDisabledByModule =
      (!pkg.type || pkg.type === 'package') &&
      modules.some((module) => module.name === pkg.name);

    const isModuleStreamConflict =
      pkg.type === 'module' &&
      modules.some((module) => module.name === pkg.module_name) &&
      !modules.some((m) => m.stream === pkg.stream);

    return (
      isModuleDisabledByPackage ||
      isPackageDisabledByModule ||
      isModuleStreamConflict
    );
  };

  const formatDate = (date: string | undefined) => {
    if (!date) {
      return <>N/A</>;
    }

    const retirementDate = new Date(date);

    const currentDate = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const differenceInDays = Math.round(
      (retirementDate.getTime() - currentDate.getTime()) / msPerDay,
    );

    let icon;

    switch (true) {
      case differenceInDays < 0:
        icon = (
          <Icon status='danger' isInline>
            <ExclamationCircleIcon />
          </Icon>
        );
        break;
      case differenceInDays <= 365:
        icon = (
          <Icon status='warning' isInline>
            <ExclamationTriangleIcon />
          </Icon>
        );
        break;
      case differenceInDays > 365:
        icon = (
          <Icon status='success' isInline>
            <CheckCircleIcon />
          </Icon>
        );
        break;
    }

    return (
      <>
        {icon}{' '}
        {retirementDate.toLocaleString('en-US', { month: 'short' }) +
          ' ' +
          retirementDate.getFullYear()}
      </>
    );
  };

  const composePkgTable = () => {
    let rows: ReactElement[] = [];

    if (showGroups) {
      rows = rows.concat(
        transformedGroups
          .slice(computeStart(), computeEnd())
          .map((grp, rowIndex) => (
            <Tbody
              key={`${grp.name}-${grp.repository || 'default'}`}
              isExpanded={isGroupExpanded(grp.name)}
            >
              <Tr data-testid='package-row'>
                <Td
                  expand={{
                    rowIndex: rowIndex,
                    isExpanded: isGroupExpanded(grp.name),
                    onToggle: () =>
                      setGroupsExpanded(grp.name, !isGroupExpanded(grp.name)),
                    expandId: `${grp.name}-expandable`,
                  }}
                />
                <Td
                  select={{
                    isSelected: groups.some((g) => g.name === grp.name),
                    rowIndex: rowIndex,
                    onSelect: (event, isSelecting) =>
                      handleGroupSelect(grp, rowIndex, isSelecting),
                  }}
                />
                <Td>
                  @{grp.name}
                  <Popover
                    minWidth='25rem'
                    headerContent='Included packages'
                    bodyContent={
                      <div
                        style={
                          grp.package_list.length > 0
                            ? { height: '40em', overflow: 'scroll' }
                            : {}
                        }
                      >
                        {grp.package_list.length > 0 ? (
                          <Table
                            variant='compact'
                            data-testid='group-included-packages-table'
                          >
                            <Tbody>
                              {grp.package_list.map((pkg) => (
                                <Tr key={`details-${pkg}`}>
                                  <Td>{pkg}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        ) : (
                          <Content>This group has no packages</Content>
                        )}
                      </div>
                    }
                  >
                    <Button
                      icon={<HelpIcon className='pf-v6-u-ml-xs' />}
                      variant='plain'
                      aria-label='About included packages'
                      component='span'
                      className='pf-v6-u-p-0'
                      isInline
                    />
                  </Popover>
                </Td>
                <Td>N/A</Td>
                <Td>N/A</Td>
              </Tr>
              <Tr isExpanded={isGroupExpanded(grp.name)}>
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    {
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>
                            Description
                            {toggleSelected === 'toggle-selected' && (
                              <PackageInfoNotAvailablePopover />
                            )}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {grp.description
                              ? grp.description
                              : 'Not available'}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    }
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          )),
      );
    }

    if (showPackages) {
      rows = rows.concat(
        sortedPackages
          .slice(computeStart(), computeEnd())
          .map((pkg, rowIndex) => (
            <Tbody
              key={`${pkg.name}-${pkg.stream || 'default'}-${pkg.module_name || pkg.name}`}
              isExpanded={isPkgExpanded(pkg)}
            >
              <Tr data-testid='package-row'>
                <Td
                  expand={{
                    rowIndex: rowIndex,
                    isExpanded: isPkgExpanded(pkg),
                    onToggle: () => setPkgExpanded(pkg, !isPkgExpanded(pkg)),
                    expandId: `${pkg.name}-expandable`,
                  }}
                />
                <Td
                  select={{
                    isSelected: isPackageSelected(pkg),
                    rowIndex: rowIndex,
                    onSelect: (event, isSelecting) =>
                      handleSelect(pkg, rowIndex, isSelecting),
                    isDisabled: isSelectDisabled(pkg),
                  }}
                  title={
                    isSelectDisabled(pkg)
                      ? 'Disabled due to the package(s) you selected. You cannot select packages from different application stream versions.'
                      : ''
                  }
                />
                <Td>{pkg.name}</Td>
                <Td>{pkg.stream ? pkg.stream : 'N/A'}</Td>
                <Td>{pkg.end_date ? formatDate(pkg.end_date) : 'N/A'}</Td>
              </Tr>
              <Tr isExpanded={isPkgExpanded(pkg)}>
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    {
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>
                            Description
                            {toggleSelected === 'toggle-selected' && (
                              <PackageInfoNotAvailablePopover />
                            )}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {pkg.summary ? pkg.summary : 'Not available'}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    }
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          )),
      );
    }
    return rows;
  };

  const bodyContent = useMemo(() => {
    switch (true) {
      case debouncedSearchTermLengthOf1 && !debouncedSearchTermIsGroup:
        return TooShort();
      case (toggleSelected === 'toggle-selected' &&
        packages.length === 0 &&
        groups.length === 0) ||
        (!debouncedSearchTerm && toggleSelected === 'toggle-available'):
        return <EmptySearch />;
      case (debouncedSearchTerm &&
        (isLoadingRecommendedPackages || isLoadingRecommendedGroups) &&
        activeTabKey === Repos.OTHER) ||
        (debouncedSearchTerm &&
          (isLoadingDistroPackages ||
            isLoadingCustomPackages ||
            isLoadingDistroGroups ||
            isLoadingReposInTemplate ||
            isLoadingCustomGroups) &&
          activeTabKey === Repos.INCLUDED):
        return <Searching />;
      case debouncedSearchTerm &&
        transformedPackages.length === 0 &&
        transformedGroups.length === 0 &&
        toggleSelected === 'toggle-available':
        return <NoResultsFound isOnPremise={isOnPremise} />;
      case debouncedSearchTerm &&
        toggleSelected === 'toggle-selected' &&
        activeTabKey === Repos.OTHER &&
        packages.length > 0 &&
        groups.length > 0:
        return <TryLookingUnderIncluded />;
      default:
        return composePkgTable();
    }
    // Would need significant rewrite to fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    perPage,
    debouncedSearchTerm,
    debouncedSearchTermLengthOf1,
    debouncedSearchTermIsGroup,
    isLoadingCustomPackages,
    isLoadingDistroPackages,
    isLoadingRecommendedPackages,
    isSuccessRecommendedPackages,
    isLoadingDistroGroups,
    isLoadingCustomGroups,
    isLoadingRecommendedGroups,
    packages.length,
    groups.length,
    toggleSelected,
    activeTabKey,
    transformedPackages,
    transformedGroups,
    isSelectingPackage,
    recommendedRepositories,
    transformedPackages.length,
    transformedGroups.length,
    expandedPkgs,
    expandedGroups,
    sortedPackages,
    activeSortDirection,
    activeSortIndex,
    template,
  ]);

  const PackagesTable = () => {
    return (
      <Table variant='compact' data-testid='packages-table'>
        <Thead>
          <Tr>
            <Th aria-label='Expanded' />
            <Th aria-label='Selected' />
            <Th sort={getSortParams(0)} width={30}>
              Name
            </Th>
            <Th sort={getSortParams(2)} width={20}>
              Application stream
            </Th>
            <Th sort={getSortParams(3)} width={30}>
              Retirement date
            </Th>
          </Tr>
        </Thead>
        {bodyContent}
      </Table>
    );
  };

  return (
    <>
      <RepositoryModal />
      <Toolbar>
        <Stack>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                type='text'
                placeholder='Search packages'
                aria-label='Search packages'
                data-testid='packages-search-input'
                value={searchTerm}
                onChange={handleSearch}
                onClear={() => handleClear()}
              />
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup>
                <ToggleGroupItem
                  text='Available'
                  buttonId='toggle-available'
                  isSelected={toggleSelected === 'toggle-available'}
                  onChange={handleFilterToggleClick}
                />
                <ToggleGroupItem
                  text={`Selected${
                    packages.length + groups.length === 0
                      ? ''
                      : packages.length + groups.length <= 100
                        ? ` (${packages.length + groups.length})`
                        : ' (100+)'
                  }`}
                  buttonId='toggle-selected'
                  isSelected={toggleSelected === 'toggle-selected'}
                  onChange={handleFilterToggleClick}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem variant='pagination'>
              <Pagination
                data-testid='packages-pagination-top'
                itemCount={
                  searchTerm === '' && toggleSelected === 'toggle-available'
                    ? 0
                    : showPackages && showGroups
                      ? transformedPackages.length + transformedGroups.length
                      : showPackages
                        ? transformedPackages.length
                        : transformedGroups.length
                }
                perPage={perPage}
                page={page}
                onSetPage={handleSetPage}
                onPerPageSelect={handlePerPageSelect}
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
          <ToolbarContent>
            <CustomHelperText
              hide={!debouncedSearchTermLengthOf1 || debouncedSearchTermIsGroup}
              textValue='The search value must be greater than 1 character'
            />
          </ToolbarContent>
        </Stack>
      </Toolbar>

      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label='Repositories tabs on packages step'
      >
        <Tab
          eventKey='included-repos'
          title={<TabTitleText>Included repos</TabTitleText>}
          actions={<IncludedReposPopover />}
          aria-label='Included repositories'
        />
        {!isOnPremise && (
          <Tab
            eventKey='other-repos'
            title={<TabTitleText>Other repos</TabTitleText>}
            actions={<OtherReposPopover />}
            aria-label='Other repositories'
          />
        )}
      </Tabs>
      <PackagesTable />
      <Pagination
        data-testid='packages-pagination-bottom'
        itemCount={
          searchTerm === '' && toggleSelected === 'toggle-available'
            ? 0
            : showPackages && showGroups
              ? transformedPackages.length + transformedGroups.length
              : showPackages
                ? transformedPackages.length
                : transformedGroups.length
        }
        perPage={perPage}
        page={page}
        onSetPage={handleSetPage}
        onPerPageSelect={handlePerPageSelect}
        variant={PaginationVariant.bottom}
      />
    </>
  );
};

export default Packages;
