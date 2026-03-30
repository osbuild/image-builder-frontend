import React, { useMemo, useState } from 'react';

import {
  Button,
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
import { useDispatch } from 'react-redux';

import { ApiRepositoryCollectionResponseRead } from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import {
  addPackage,
  addPackageGroup,
  removePackage,
  removePackageGroup,
  removeRecommendedRepository,
  selectGroups,
  selectPackages,
  selectRecommendedRepositories,
} from '@/store/slices/wizard';

import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
  Repos,
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
  setActiveTabKey: (value: Repos) => void;
  setToggleSelected: (value: string) => void;
  setActiveStream: (value: string) => void;
  setActiveSortIndex: (value: number) => void;
  setActiveSortDirection: (value: 'asc' | 'desc') => void;
  setPage: (value: number) => void;
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
  setActiveTabKey,
  setToggleSelected,
  setActiveStream,
  setActiveSortIndex,
  setActiveSortDirection,
  setPage,
}: PackageSearchProps) => {
  const dispatch = useDispatch();
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);

  const [isOpen, setIsOpen] = useState(false);

  const packageTypeLabel =
    packageType === 'packages' ? 'packages' : 'package groups';

  const selectedPackageNames = useMemo(
    () => packages.map((p) => p.name),
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
    setActiveTabKey(Repos.INCLUDED);
    setToggleSelected('toggle-available');
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
    setPage(1);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setSearchTerm('');
    setIsOpen(false);
    setActiveTabKey(Repos.INCLUDED);
    setActiveStream('');
    setActiveSortIndex(0);
    setActiveSortDirection('asc');
  };

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (!value || typeof value !== 'string') return;

    if (packageType === 'packages') {
      const pkg = transformedPackages.find((p) => p.name === value);
      if (!pkg) return;

      const isSelected = packages.some((p) => p.name === pkg.name);

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
        }
      } else {
        dispatch(removePackage(pkg.name));
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
    <Select
      isScrollable
      isOpen={isOpen}
      selected={
        packageType === 'packages' ? selectedPackageNames : selectedGroupNames
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
        ) : packageType === 'packages' && transformedPackages.length > 0 ? (
          transformedPackages.slice(0, 50).map((pkg) => (
            <SelectOption
              key={`${pkg.name}-${pkg.repository}-${pkg.stream || ''}`}
              value={pkg.name}
              description={pkg.summary}
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
        ) : (
          <SelectOption isDisabled>
            No {packageTypeLabel} found for &quot;{debouncedSearchTerm}&quot;
          </SelectOption>
        )}
      </SelectList>
    </Select>
  );
};

export default PackageSearch;
