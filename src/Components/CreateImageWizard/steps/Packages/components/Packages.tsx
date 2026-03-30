import React, { useEffect, useMemo, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Stack,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { orderBy } from 'lodash';
import { useDispatch } from 'react-redux';

import { useGetArchitecturesQuery } from '@/store/api/backend';
import {
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRepositoryModuleStreamsMutation,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { selectIsOnPremise } from '@/store/slices/env';
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
} from '@/store/slices/wizard';

import CustomHelperText from './CustomHelperText';
import PackageSearch from './PackageSearch';
import PackagesTable from './PackagesTable';
import RepositoryModal from './RepositoryModal';

import {
  ContentOrigin,
  EPEL_10_REPO_DEFINITION,
} from '../../../../../constants';
import { useAppSelector } from '../../../../../store/hooks';
import { asDistribution } from '../../../../../store/typeGuards';
import { getEpelUrlForDistribution } from '../../../../../Utilities/epel';
import { convertStringToDate } from '../../../../../Utilities/time';
import useDebounce from '../../../../../Utilities/useDebounce';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  ItemWithSources,
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

  const { data: { data: reposInTemplate = [] } = {} } =
    useListRepositoriesQuery({
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

  const distroUrls = useMemo(() => {
    return (
      distroRepositories
        ?.find((archItem) => archItem.arch === arch)
        ?.repositories.filter((repo) => !!repo.baseurl)
        .map((repo) => repo.baseurl!) ?? []
    );
  }, [distroRepositories, arch]);

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: epelRepo, isSuccess: isSuccessEpelRepo } =
    useListRepositoriesQuery({
      url: epelRepoUrlByDistribution,
      origin: ContentOrigin.COMMUNITY,
    });

  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();
  const [packageType, setPackageType] = useState<'packages' | 'groups'>(
    'packages',
  );
  const [isPackageTypeDropdownOpen, setIsPackageTypeDropdownOpen] =
    useState(false);
  const [isSearchingOtherRepos, setIsSearchingOtherRepos] = useState(false);

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
    if (packageType === 'groups') {
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
    if (debouncedSearchTerm.length > 2 && customRepositories.length > 0) {
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
    }
    if (
      debouncedSearchTerm.length > 2 &&
      isSearchingOtherRepos &&
      !isOnPremise
    ) {
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
  }, [
    customRepositories,
    searchCustomRpms,
    searchDistroRpms,
    searchRecommendedRpms,
    debouncedSearchTerm,
    isSuccessDistroRepositories,
    arch,
    template,
    distribution,
    packageType,
    snapshotDate,
    distroUrls,
    isOnPremise,
    reposInTemplate,
    isSearchingOtherRepos,
    epelRepoUrlByDistribution,
  ]);

  useEffect(() => {
    if (packageType === 'packages') {
      return;
    }
    if (isSuccessDistroRepositories) {
      searchDistroGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          urls: distroUrls,
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (customRepositories.length > 0) {
      searchCustomGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
          uuids: customRepositories.flatMap((repo) => {
            return repo.id;
          }),
          date: snapshotDate
            ? new Date(convertStringToDate(snapshotDate)).toISOString()
            : undefined,
        },
      });
    }
    if (isSearchingOtherRepos && !isOnPremise) {
      searchRecommendedGroups({
        apiContentUnitSearchRequest: {
          search: debouncedSearchTerm,
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
    packageType,
    arch,
    distroRepositories,
    isSuccessDistroRepositories,
    snapshotDate,
    distroUrls,
    isSearchingOtherRepos,
    isOnPremise,
    epelRepoUrlByDistribution,
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

    if (isSuccessDistroPackages && !isSearchingOtherRepos) {
      transformedDistroData = dataDistroPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'distro',
        sources: values.package_sources,
      }));
    }

    if (isSuccessCustomPackages && !isSearchingOtherRepos) {
      transformedCustomData = dataCustomPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'custom',
        sources: values.package_sources,
      }));
    }

    if (isSuccessRecommendedPackages && isSearchingOtherRepos) {
      transformedRecommendedData = dataRecommendedPackages.map((values) => ({
        name: values.package_name!,
        summary: values.summary!,
        repository: 'recommended',
        sources: values.package_sources,
      }));
    }

    const combinedPackageData = transformedDistroData
      .concat(transformedCustomData)
      .concat(transformedRecommendedData);

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

    return unpackedData;
  }, [
    dataCustomPackages,
    dataDistroPackages,
    dataRecommendedPackages,
    isSuccessCustomPackages,
    isSuccessDistroPackages,
    isSuccessRecommendedPackages,
    isSearchingOtherRepos,
  ]);

  const transformedGroups = useMemo(() => {
    let combinedGroupData: GroupWithRepositoryInfo[] = [];

    if (isSuccessDistroGroups && !isSearchingOtherRepos) {
      combinedGroupData = combinedGroupData.concat(
        dataDistroGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'distro',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessCustomGroups && !isSearchingOtherRepos) {
      combinedGroupData = combinedGroupData.concat(
        dataCustomGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'custom',
          package_list: values.package_list!,
        })),
      );
    }
    if (isSuccessRecommendedGroups && isSearchingOtherRepos) {
      combinedGroupData = combinedGroupData.concat(
        dataRecommendedGroups!.map((values) => ({
          name: values.id!,
          description: values.description!,
          repository: 'recommended',
          package_list: values.package_list!,
        })),
      );
    }

    return combinedGroupData;
  }, [
    dataDistroGroups,
    dataCustomGroups,
    dataRecommendedGroups,
    isSuccessDistroGroups,
    isSuccessCustomGroups,
    isSuccessRecommendedGroups,
    isSearchingOtherRepos,
  ]);

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
              <FormGroup label='Package type'>
                <Select
                  id='package-type-select'
                  isOpen={isPackageTypeDropdownOpen}
                  selected={packageType}
                  onSelect={(_event, value) => {
                    setPackageType(value as 'packages' | 'groups');
                    setIsPackageTypeDropdownOpen(false);
                  }}
                  onOpenChange={(isOpen) =>
                    setIsPackageTypeDropdownOpen(isOpen)
                  }
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() =>
                        setIsPackageTypeDropdownOpen(!isPackageTypeDropdownOpen)
                      }
                      isExpanded={isPackageTypeDropdownOpen}
                    >
                      {packageType === 'packages'
                        ? 'Individual packages'
                        : 'Package groups'}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value='packages'>
                      Individual packages
                    </SelectOption>
                    <SelectOption value='groups'>Package groups</SelectOption>
                  </SelectList>
                </Select>
              </FormGroup>
            </ToolbarItem>
            <ToolbarItem>
              <PackageSearch
                packageType={packageType}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                transformedPackages={transformedPackages}
                transformedGroups={transformedGroups}
                isLoadingDistroPackages={isLoadingDistroPackages}
                isLoadingCustomPackages={isLoadingCustomPackages}
                isLoadingRecommendedPackages={isLoadingRecommendedPackages}
                isLoadingDistroGroups={isLoadingDistroGroups}
                isLoadingCustomGroups={isLoadingCustomGroups}
                isLoadingRecommendedGroups={isLoadingRecommendedGroups}
                debouncedSearchTerm={debouncedSearchTerm}
                isSuccessEpelRepo={isSuccessEpelRepo}
                epelRepo={epelRepo}
                setIsRepoModalOpen={setIsRepoModalOpen}
                setIsSelectingPackage={setIsSelectingPackage}
                setIsSelectingGroup={setIsSelectingGroup}
                activeStream={activeStream}
                setActiveStream={setActiveStream}
                isSearchingOtherRepos={isSearchingOtherRepos}
                setIsSearchingOtherRepos={setIsSearchingOtherRepos}
              />
            </ToolbarItem>
          </ToolbarContent>
          <ToolbarContent>
            <CustomHelperText
              hide={!debouncedSearchTermLengthOf1}
              textValue='The search value must be greater than 1 character'
            />
          </ToolbarContent>
        </Stack>
      </Toolbar>
      <PackagesTable
        isSuccessEpelRepo={isSuccessEpelRepo}
        epelRepo={epelRepo}
        setIsRepoModalOpen={setIsRepoModalOpen}
        setIsSelectingPackage={setIsSelectingPackage}
        setActiveStream={setActiveStream}
        packages={packages}
        groups={groups}
        modules={modules}
        setIsSelectingGroup={setIsSelectingGroup}
        activeStream={activeStream}
        isSelectingPackage={isSelectingPackage}
      />
    </>
  );
};

export default Packages;
