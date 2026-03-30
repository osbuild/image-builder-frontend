import React, { useMemo, useState } from 'react';

import {
  Button,
  Content,
  Divider,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import { orderBy } from 'lodash';
import { useDispatch } from 'react-redux';

import { Module } from '@/store/api/backend';
import { ApiRepositoryCollectionResponseRead } from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  addModule,
  addPackage,
  addPackageGroup,
  removeModule,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectGroups,
  selectModules,
  selectPackages,
  selectRecommendedRepositories,
} from '@/store/slices/wizard';

import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

type PackageSearchProps = {
  packageType: 'packages' | 'groups';
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  transformedPackages: IBPackageWithRepositoryInfo[];
  transformedGroups: GroupWithRepositoryInfo[];
  isLoadingDistroPackages: boolean;
  isLoadingCustomPackages: boolean;
  isLoadingRecommendedPackages: boolean;
  isLoadingDistroGroups: boolean;
  isLoadingCustomGroups: boolean;
  isLoadingRecommendedGroups: boolean;
  debouncedSearchTerm: string;
  isSuccessEpelRepo: boolean;
  epelRepo: ApiRepositoryCollectionResponseRead | undefined;
  setIsRepoModalOpen: (value: boolean) => void;
  setIsSelectingPackage: (
    value: IBPackageWithRepositoryInfo | undefined,
  ) => void;
  setIsSelectingGroup: (value: GroupWithRepositoryInfo | undefined) => void;
  activeStream: string;
  setActiveStream: (value: string) => void;
  setActiveSortIndex: (value: number) => void;
  setActiveSortDirection: (value: 'asc' | 'desc') => void;
  setPage: (value: number) => void;
  isSearchingOtherRepos: boolean;
  setIsSearchingOtherRepos: (value: boolean) => void;
};

const PackageSearch = ({
  packageType,
  searchTerm,
  setSearchTerm,
  transformedPackages,
  transformedGroups,
  isLoadingDistroPackages,
  isLoadingCustomPackages,
  isLoadingRecommendedPackages,
  isLoadingDistroGroups,
  isLoadingCustomGroups,
  isLoadingRecommendedGroups,
  debouncedSearchTerm,
  isSuccessEpelRepo,
  epelRepo,
  setIsRepoModalOpen,
  setIsSelectingPackage,
  setIsSelectingGroup,
  activeStream,
  setActiveStream,
  setActiveSortIndex,
  setActiveSortDirection,
  setPage,
  isSearchingOtherRepos,
  setIsSearchingOtherRepos,
}: PackageSearchProps) => {
  const dispatch = useDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const modules = useAppSelector(selectModules);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const [isOpen, setIsOpen] = useState(false);

  const sortedPackages = useMemo(() => {
    if (transformedPackages.length < 1 || !Array.isArray(transformedPackages)) {
      return [];
    }

    return orderBy(
      transformedPackages,
      [
        (pkg) => (activeStream && pkg.stream === activeStream ? 0 : 1),
        'name',
        (pkg) => {
          if (!pkg.stream) return '';
          const parts = pkg.stream
            .split('.')
            .map((part: string) => parseInt(part, 10) || 0);
          return parts
            .map((p: number) => p.toString().padStart(10, '0'))
            .join('.');
        },
        (pkg) => pkg.end_date || '9999-12-31',
        (pkg) => pkg.repository || '',
        (pkg) => pkg.module_name || '',
      ],
      ['asc', 'asc', 'desc', 'asc', 'asc', 'asc'],
    );
  }, [transformedPackages, activeStream]);

  const isSelectDisabled = (pkg: IBPackageWithRepositoryInfo) => {
    const isModuleDisabledByPackage =
      pkg.type === 'module' &&
      packages.some(
        (p) => (!p.type || p.type === 'package') && p.name === pkg.module_name,
      );

    const isPackageDisabledByModule =
      (!pkg.type || pkg.type === 'package') &&
      modules.some((module: Module) => module.name === pkg.name);

    const isModuleStreamConflict =
      pkg.type === 'module' &&
      modules.some((module: Module) => module.name === pkg.module_name) &&
      !modules.some((m: Module) => m.stream === pkg.stream);

    return (
      isModuleDisabledByPackage ||
      isPackageDisabledByModule ||
      isModuleStreamConflict
    );
  };

  const getPackageDescription = (pkg: IBPackageWithRepositoryInfo) => {
    const parts = [];
    if (pkg.stream) {
      parts.push(pkg.stream);
    }
    if (pkg.end_date) {
      const retirementDate = new Date(pkg.end_date);
      const formattedDate =
        retirementDate.toLocaleString('en-US', { month: 'short' }) +
        ' ' +
        retirementDate.getFullYear();
      parts.push(formattedDate);
    }
    if (pkg.summary) {
      parts.push(pkg.summary);
    }
    return parts.join(', ');
  };

  const packageTypeLabel =
    packageType === 'packages' ? 'packages' : 'package groups';

  const selectedPackageKeys = useMemo(
    () => packages.map((p) => `${p.name}|||${p.stream || ''}`),
    [packages],
  );
  const selectedGroupNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const onInputClick = () => {
    if (!isOpen && searchTerm) {
      setIsOpen(true);
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
    setPage(1);
    if (value === '') {
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
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
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
          epelRepo &&
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
        }
      } else {
        dispatch(removePackage(pkg.name));
        if (pkg.type === 'module' && pkg.module_name) {
          dispatch(removeModule(pkg.module_name));
        }
        if (
          isSuccessEpelRepo &&
          epelRepo &&
          epelRepo.data &&
          packages.filter((pkg) => pkg.repository === 'recommended').length ===
            1 &&
          groups.filter((grp) => grp.repository === 'recommended').length === 0
        ) {
          dispatch(removeRecommendedRepository(epelRepo.data[0]));
        }
      }
    } else {
      const grp = transformedGroups.find((g) => g.name === value);
      if (!grp) return;

      const isSelected = groups.some((g) => g.name === grp.name);

      if (!isSelected) {
        if (
          isSuccessEpelRepo &&
          epelRepo &&
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
          epelRepo &&
          epelRepo.data &&
          groups.filter((grp) => grp.repository === 'recommended').length ===
            1 &&
          packages.filter((pkg) => pkg.repository === 'recommended').length ===
            0
        ) {
          dispatch(removeRecommendedRepository(epelRepo.data[0]));
        }
      }
    }

    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant='typeahead'
      onClick={onToggleClick}
      isExpanded={isOpen}
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
    <FormGroup label='Packages'>
      <Select
        isScrollable
        isOpen={isOpen}
        selected={
          packageType === 'packages' ? selectedPackageKeys : selectedGroupNames
        }
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {!debouncedSearchTerm ? (
            <SelectOption isDisabled>
              Start typing to search {packageTypeLabel}
            </SelectOption>
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
            sortedPackages.slice(0, 50).map((pkg) => (
              <SelectOption
                key={`${pkg.name}-${pkg.repository}-${pkg.stream || ''}`}
                value={`${pkg.name}|||${pkg.stream || ''}`}
                description={getPackageDescription(pkg)}
                isDisabled={isSelectDisabled(pkg)}
              >
                {pkg.name}
              </SelectOption>
            ))
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
          ) : !isSearchingOtherRepos && !isOnPremise ? (
            <>
              <SelectOption isDisabled>
                No {packageTypeLabel} found in included repositories
              </SelectOption>
              <Divider />
              <SelectOption
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchingOtherRepos(true);
                }}
              >
                Search in other repositories
              </SelectOption>
            </>
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
    </FormGroup>
  );
};

export default PackageSearch;
