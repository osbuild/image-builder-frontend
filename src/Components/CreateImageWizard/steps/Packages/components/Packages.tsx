import React, { useEffect, useMemo, useState } from 'react';

import {
  Pagination,
  PaginationVariant,
  SearchInput,
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
import { orderBy } from 'lodash';
import { useDispatch } from 'react-redux';

import CustomHelperText from './CustomHelperText';
import PackagesTable from './PackagesTable';
import { IncludedReposPopover, OtherReposPopover } from './RepoPopovers';
import RepositoryModal from './RepositoryModal';

import {
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '../../../../../constants';
import { useGetArchitecturesQuery } from '../../../../../store/backendApi';
import {
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRepositoryModuleStreamsMutation,
  useSearchRpmMutation,
} from '../../../../../store/contentSourcesApi';
import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { asDistribution } from '../../../../../store/typeGuards';
import {
  addPackage,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectGroups,
  selectModules,
  selectPackages,
  selectSnapshotDate,
  selectTemplate,
  selectWizardMode,
} from '../../../../../store/wizardSlice';
import { getEpelUrlForDistribution } from '../../../../../Utilities/epel';
import { convertStringToDate } from '../../../../../Utilities/time';
import useDebounce from '../../../../../Utilities/useDebounce';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  ItemWithSources,
  Repos,
} from '../packagesTypes';

const Packages = () => {
  const dispatch = useDispatch();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const modules = useAppSelector(selectModules);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const wizardMode = useAppSelector(selectWizardMode);

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
      distribution: asDistribution(distribution),
    });

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.EXTERNAL,
    });

  const distroUrls = useMemo(() => {
    return (
      distroRepositories
        ?.find((archItem) => archItem.arch === arch)
        ?.repositories.filter((repo) => !!repo.baseurl)
        .map((repo) => repo.baseurl!) ?? []
    );
  }, [distroRepositories, arch]);

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
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<
    'asc' | 'desc'
  >('asc');
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

  const [
    searchModulesInfo,
    { data: dataModulesInfo, isSuccess: isSuccessModulesInfo },
  ] = useSearchRepositoryModuleStreamsMutation();

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
                ? distroUrls
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
    distroUrls,
  ]);

  useEffect(() => {
    if (!debouncedSearchTermIsGroup) {
      return;
    }
    if (isSuccessDistroRepositories) {
      searchDistroGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm.substring(1),
          urls: distroUrls,
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
    distroUrls,
  ]);

  useEffect(() => {
    if (
      wizardMode !== 'create' &&
      isSuccessDistroRepositories &&
      modules.length > 0
    ) {
      searchModulesInfo({
        apiSearchModuleStreamsRequest: {
          rpm_names: modules.map((module) => module.name),
          urls: [...distroUrls, epelRepoUrlByDistribution],
          uuids: [],
        },
      });
    }
  }, [isSuccessDistroRepositories, modules, distroUrls]);

  useEffect(() => {
    if (!isSuccessModulesInfo) return;

    dataModulesInfo.forEach((module) => {
      const enabledModule = modules.find((m) => m.name === module.module_name);

      module.streams
        ?.find((stream) => stream.stream === enabledModule?.stream)
        ?.package_names?.forEach((packageName) => {
          const existingPackage = packages.find(
            (pkg) => pkg.name === packageName,
          );

          if (existingPackage && module.module_name && enabledModule) {
            dispatch(
              addPackage({
                ...existingPackage,
                type: 'module',
                module_name: module.module_name,
                stream: enabledModule.stream,
              }),
            );
          }
        });
    });
  }, [dataModulesInfo, dispatch, isSuccessModulesInfo, modules]);

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

  return (
    <>
      <RepositoryModal
        isRepoModalOpen={isRepoModalOpen}
        setIsRepoModalOpen={setIsRepoModalOpen}
        isSelectingPackage={isSelectingPackage}
        setIsSelectingPackage={setIsSelectingPackage}
        isSelectingGroup={isSelectingGroup}
        epelRepo={epelRepo}
      />
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
          actions={!isOnPremise ? <IncludedReposPopover /> : undefined}
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
      <PackagesTable
        isSuccessEpelRepo={isSuccessEpelRepo}
        epelRepo={epelRepo}
        setIsRepoModalOpen={setIsRepoModalOpen}
        setIsSelectingPackage={setIsSelectingPackage}
        setActiveStream={setActiveStream}
        setCurrentlyRemovedPackages={setCurrentlyRemovedPackages}
        packages={packages}
        groups={groups}
        modules={modules}
        setIsSelectingGroup={setIsSelectingGroup}
        activeSortIndex={activeSortIndex}
        setActiveSortIndex={setActiveSortIndex}
        activeSortDirection={activeSortDirection}
        setActiveSortDirection={setActiveSortDirection}
        transformedPackages={transformedPackages}
        activeStream={activeStream}
        perPage={perPage}
        page={page}
        showGroups={showGroups}
        showPackages={showPackages}
        transformedGroups={transformedGroups}
        toggleSelected={toggleSelected}
        isLoadingRecommendedPackages={isLoadingRecommendedPackages}
        isLoadingDistroPackages={isLoadingDistroPackages}
        isLoadingCustomPackages={isLoadingCustomPackages}
        isLoadingRecommendedGroups={isLoadingRecommendedGroups}
        isLoadingDistroGroups={isLoadingDistroGroups}
        isLoadingCustomGroups={isLoadingCustomGroups}
        isLoadingReposInTemplate={isLoadingReposInTemplate}
        isSuccessRecommendedPackages={isSuccessRecommendedPackages}
        isSelectingPackage={isSelectingPackage}
        debouncedSearchTerm={debouncedSearchTerm}
        debouncedSearchTermLengthOf1={debouncedSearchTermLengthOf1}
        debouncedSearchTermIsGroup={debouncedSearchTermIsGroup}
        activeTabKey={activeTabKey}
        setActiveTabKey={setActiveTabKey}
        template={template}
      />
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
