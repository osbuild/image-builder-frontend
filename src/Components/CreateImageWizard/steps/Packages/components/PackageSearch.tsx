import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Content,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { OptimizeIcon, SearchIcon, TimesIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import ManageRepositoriesButton from '@/Components/CreateImageWizard/steps/Repositories/components/ManageRepositoriesButton';
import { AMPLITUDE_MODULE_NAME, EPEL_10_REPO_DEFINITION } from '@/constants';
import { Module, useGetArchitecturesQuery } from '@/store/api/backend';
import {
  useGetTemplateQuery,
  useListRepositoriesQuery,
  useSearchPackageGroupMutation,
  useSearchRepositoryModuleStreamsMutation,
  useSearchRpmMutation,
} from '@/store/api/contentSources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  addModule,
  addPackage,
  addPackageGroup,
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  selectArchitecture,
  selectCustomRepositories,
  selectDistribution,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectTemplate,
  selectWizardMode,
} from '@/store/slices/wizard';
import { getEpelUrlForDistribution } from '@/Utilities/epel';
import { convertStringToDate } from '@/Utilities/time';
import useDebounce from '@/Utilities/useDebounce';

import {
  getPackageDescription,
  isSelectDisabled,
  useEpelRepo,
  usePackageRecommendations,
  useRemovePackageContent,
  useRequiredPackages,
  useSearchAnalytics,
  useTransformedSearchResults,
} from '../packagesUtilities';

type PackageSearchProps = {
  packageType: 'packages' | 'groups';
  setIsRepoModalOpen: (value: boolean) => void;
  setIsSelectingPackage: (
    value: IBPackageWithRepositoryInfo | undefined,
  ) => void;
  setIsSelectingGroup: (value: GroupWithRepositoryInfo | undefined) => void;
  activeStream: string;
  setActiveStream: (value: string) => void;
};

const PackageSearch = ({
  packageType,
  setIsRepoModalOpen,
  setIsSelectingPackage,
  setIsSelectingGroup,
  activeStream,
  setActiveStream,
}: PackageSearchProps) => {
  const dispatch = useAppDispatch();
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const modules = useAppSelector(selectModules);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const template = useAppSelector(selectTemplate);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const wizardMode = useAppSelector(selectWizardMode);

  const { isSuccess: isSuccessEpelRepo } = useEpelRepo();
  const { handleRemovePackage, handleRemoveGroup } = useRemovePackageContent();

  const requiredSet = useRequiredPackages();

  const isRequiredAndSelected = (pkg: IBPackageWithRepositoryInfo) =>
    requiredSet.has(pkg.name) && packages.some((p) => p.name === pkg.name);

  const {
    transformedRecommendations,
    isLoadingRecommendations,
    isErrorRecommendations,
    recommendationsData,
  } = usePackageRecommendations(packageType);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingOtherRepos, setIsSearchingOtherRepos] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useSearchAnalytics(
    isOpen,
    packageType,
    transformedRecommendations,
    recommendationsData,
  );

  const epelRepoUrlByDistribution =
    getEpelUrlForDistribution(distribution) ?? EPEL_10_REPO_DEFINITION.url;

  const { data: templateData } = useGetTemplateQuery({
    uuid: template,
  });

  const EMPTY_ARRAY: never[] = useMemo(() => [], []);
  const { data: { data: reposInTemplate = EMPTY_ARRAY } = {} } =
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
      distribution: distribution,
    });

  const distroUrls = useMemo(() => {
    const urls = distroRepositories
      ?.find((archItem) => archItem.arch === arch)
      ?.repositories.filter((repo) => !!repo.baseurl)
      .map((repo) => repo.baseurl!);
    return urls ?? EMPTY_ARRAY;
  }, [distroRepositories, arch]);

  const [
    searchCustomRpms,
    {
      data: dataCustomPackages,
      isSuccess: isSuccessCustomPackages,
      isLoading: isLoadingCustomPackages,
    },
  ] = useSearchRpmMutation();

  const debouncedSearchTerm = useDebounce(searchTerm.trim());

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

  const { transformedGroups, sortedPackages } =
    useTransformedSearchResults({
      dataDistroPackages,
      dataCustomPackages,
      dataRecommendedPackages,
      isSuccessDistroPackages,
      isSuccessCustomPackages,
      isSuccessRecommendedPackages,
      dataDistroGroups,
      dataCustomGroups,
      dataRecommendedGroups,
      isSuccessDistroGroups,
      isSuccessCustomGroups,
      isSuccessRecommendedGroups,
      isSearchingOtherRepos,
      debouncedSearchTerm,
      activeStream,
      transformedRecommendations,
      isLoadingRecommendations,
    });

  const isPackageSelectDisabled = (pkg: IBPackageWithRepositoryInfo) =>
    isSelectDisabled(pkg, packages, modules, requiredSet);

  const packageTypeLabel =
    packageType === 'packages' ? 'packages' : 'package groups';

  const selectedPackageKeys = useMemo(
    () => packages.map((p) => `${p.name}|||${p.stream || ''}`),
    [packages],
  );
  const selectedGroupNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const onInputClick = () => {
    if (!isOpen && (searchTerm || transformedRecommendations.length > 0)) {
      setIsOpen(true);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
    if (value === '') {
      setActiveStream('');
      setIsSearchingOtherRepos(false);
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setSearchTerm('');
    setIsOpen(false);
    setActiveStream('');
    setIsSearchingOtherRepos(false);
  };

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (!value || typeof value !== 'string') return;

    if (packageType === 'packages') {
      const [name, stream] = value.split('|||');
      const pkg = sortedPackages.find(
        (p) => p.name === name && (p.stream || '') === stream,
      );
      if (!pkg) return;

      let isSelected = false;

      if (!pkg.type || pkg.type === 'package') {
        const isModuleWithSameName = modules.some(
          (module: Module) => module.name === pkg.name,
        );
        isSelected =
          packages.some(
            (p) => p.name === pkg.name && p.stream === pkg.stream,
          ) && !isModuleWithSameName;
      }

      if (pkg.type === 'module') {
        isSelected =
          packages.some(
            (p) => p.name === pkg.name && p.stream === pkg.stream,
          ) &&
          modules.some(
            (m: Module) =>
              m.name === pkg.module_name && m.stream === pkg.stream,
          );
      }

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          pkg.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setIsRepoModalOpen(true);
          setIsSelectingPackage(pkg);
        } else {
          dispatch(addPackage(pkg));
          if (pkg.isRecommendation && !isOnPremise) {
            analytics.track(
              `${AMPLITUDE_MODULE_NAME} - Recommended Package Added`,
              {
                module: AMPLITUDE_MODULE_NAME,
                isPreview: isBeta(),
                packageName: pkg.name,
                selectedPackages: packages.map((p) => p.name),
                shownRecommendations: recommendationsData?.packages || [],
                distribution: distribution.replace('-', ''),
                modelVersion: recommendationsData?.modelVersion,
              },
            );
          }
          if (pkg.type === 'module') {
            setActiveStream(pkg.stream || '');
            dispatch(
              addModule({
                name: pkg.module_name || '',
                stream: pkg.stream || '',
              }),
            );
          }
        }
      } else if (!isRequiredAndSelected(pkg)) {
        handleRemovePackage(pkg);
      }
    } else {
      const grp = transformedGroups.find((g) => g.name === value);
      if (!grp) return;

      const isSelected = groups.some((g) => g.name === grp.name);

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          grp.repository === 'recommended' &&
          !recommendedRepositories.some((repo) => repo.name?.startsWith('EPEL'))
        ) {
          setIsRepoModalOpen(true);
          setIsSelectingGroup(grp);
        } else {
          dispatch(addPackageGroup(grp));
        }
      } else {
        handleRemoveGroup(grp);
      }
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant='typeahead'
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={searchTerm}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          isExpanded={isOpen}
          icon={<SearchIcon />}
          aria-label={`Search ${packageTypeLabel}`}
          data-testid='packages-search-input'
          placeholder='Search and add packages'
        />
        <TextInputGroupUtilities>
          <Button
            icon={<TimesIcon />}
            variant='plain'
            onClick={onClearButtonClick}
            aria-label='Clear search'
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup label='Add packages' style={{ width: '100%' }}>
      <Select
        isScrollable
        isOpen={isOpen}
        selected={
          packageType === 'packages' ? selectedPackageKeys : selectedGroupNames
        }
        onSelect={onSelect}
        onOpenChange={setIsOpen}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {!debouncedSearchTerm && sortedPackages.length === 0 ? (
            <SelectOption isDisabled>
              Start typing to search {packageTypeLabel}
            </SelectOption>
          ) : packageType === 'packages' && debouncedSearchTerm.length === 1 ? (
            <EmptyState variant='sm'>
              <EmptyStateBody>
                The search value must be greater than 1 character
              </EmptyStateBody>
            </EmptyState>
          ) : isLoadingDistroPackages ||
            isLoadingCustomPackages ||
            isLoadingRecommendedPackages ||
            isLoadingDistroGroups ||
            isLoadingCustomGroups ||
            isLoadingRecommendedGroups ? (
            <SelectOption isDisabled>
              Searching {packageTypeLabel}...
            </SelectOption>
          ) : packageType === 'packages' && sortedPackages.length > 0 ? (
            <>
              {sortedPackages.slice(0, 50).map((pkg) => (
                <SelectOption
                  key={`${pkg.name}-${pkg.repository}-${pkg.stream || ''}`}
                  value={`${pkg.name}|||${pkg.stream || ''}`}
                  description={
                    pkg.isRecommendation
                      ? 'Suggested based on your selections. Enabled by RHEL Lightspeed'
                      : getPackageDescription(pkg)
                  }
                  isDisabled={isPackageSelectDisabled(pkg)}
                >
                  {pkg.isRecommendation && (
                    <>
                      <OptimizeIcon color='var(--pf-t--global--icon--color--brand--default)' />{' '}
                    </>
                  )}
                  {pkg.isRecommendation && pkg.summary
                    ? `${pkg.name} - ${pkg.summary}`
                    : pkg.name}
                </SelectOption>
              ))}
              {isLoadingRecommendations && (
                <SelectOption isDisabled>
                  Getting package recommendations...
                </SelectOption>
              )}
            </>
          ) : packageType === 'groups' && transformedGroups.length > 0 ? (
            transformedGroups.slice(0, 50).map((group) => (
              <SelectOption
                key={`${group.name}-${group.repository}`}
                value={group.name}
                description={group.description}
              >
                {group.name}
              </SelectOption>
            ))
          ) : isLoadingRecommendations &&
            packageType === 'packages' &&
            !sortedPackages.length ? (
            <SelectOption isDisabled>
              Getting package recommendations...
            </SelectOption>
          ) : !isSearchingOtherRepos && !isOnPremise ? (
            <EmptyState variant='sm'>
              <EmptyStateBody>
                No results for &quot;{debouncedSearchTerm}&quot; in selected
                repositories. If you know the name of your repository, make sure
                it&apos;s included on the{' '}
                <ManageRepositoriesButton
                  label='Repositories page'
                  icon={true}
                />
              </EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button
                    variant='secondary'
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchingOtherRepos(true);
                    }}
                  >
                    Search repositories outside of this image
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            </EmptyState>
          ) : (
            <SelectOption isDisabled>
              No {packageTypeLabel} found for &quot;{debouncedSearchTerm}&quot;
            </SelectOption>
          )}
        </SelectList>
        {isSearchingOtherRepos &&
          (sortedPackages.length > 0 || transformedGroups.length > 0) && (
            <>
              <Divider />
              <Content style={{ padding: '8px 16px' }}>
                <Content component='small'>
                  Showing results from other repositories (EPEL)
                </Content>
              </Content>
            </>
          )}
      </Select>
      {isErrorRecommendations && packageType === 'packages' && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant='error'>
              Recommendations couldn&apos;t be fetched. Try again by changing
              your selected packages.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default PackageSearch;
