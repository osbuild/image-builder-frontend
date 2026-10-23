import React, { useMemo, useState } from 'react';

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
import { AMPLITUDE_MODULE_NAME } from '@/constants';
import { Module } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  addModule,
  addPackage,
  addPackageGroup,
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  selectDistribution,
  selectModules,
  selectPackageGroups,
  selectPackages,
  selectRecommendedRepositories,
} from '@/store/slices/wizard';

import RepositoryModal from './RepositoryModal';

import {
  getPackageDescription,
  isSelectDisabled,
  useEpelRepo,
  usePackageRecommendations,
  usePackageSearchQueries,
  useRemovePackageContent,
  useRequiredPackages,
  useSearchAnalytics,
} from '../packagesUtilities';

type PackageSearchProps = {
  packageType: 'packages' | 'groups';
  activeStream: string;
  setActiveStream: (value: string) => void;
};

const PackageSearch = ({
  packageType,
  activeStream,
  setActiveStream,
}: PackageSearchProps) => {
  const dispatch = useAppDispatch();
  const { analytics, isBeta } = useChrome();

  const isOnPremise = useAppSelector(selectIsOnPremise);
  const distribution = useAppSelector(selectDistribution);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectPackageGroups);
  const modules = useAppSelector(selectModules);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isSelectingPackage, setIsSelectingPackage] = useState<
    IBPackageWithRepositoryInfo | undefined
  >();
  const [isSelectingGroup, setIsSelectingGroup] = useState<
    GroupWithRepositoryInfo | undefined
  >();

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

  const { sortedPackages, transformedGroups, debouncedSearchTerm, isLoading } =
    usePackageSearchQueries({
      packageType,
      searchTerm,
      isSearchingOtherRepos,
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
    <>
      <RepositoryModal
        isRepoModalOpen={isRepoModalOpen}
        setIsRepoModalOpen={setIsRepoModalOpen}
        isSelectingPackage={isSelectingPackage}
        setIsSelectingPackage={setIsSelectingPackage}
        isSelectingGroup={isSelectingGroup}
      />
      <FormGroup label='Add packages' style={{ width: '100%' }}>
        <Select
          isScrollable
          isOpen={isOpen}
          selected={
            packageType === 'packages'
              ? selectedPackageKeys
              : selectedGroupNames
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
            ) : packageType === 'packages' &&
              debouncedSearchTerm.length === 1 ? (
              <EmptyState variant='sm'>
                <EmptyStateBody>
                  The search value must be greater than 1 character
                </EmptyStateBody>
              </EmptyState>
            ) : isLoading ? (
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
                  repositories. If you know the name of your repository, make
                  sure it&apos;s included on the{' '}
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
                No {packageTypeLabel} found for &quot;{debouncedSearchTerm}
                &quot;
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
    </>
  );
};

export default PackageSearch;
