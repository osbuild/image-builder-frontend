import React, { useState } from 'react';

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

import ManageRepositoriesButton from '@/Components/CreateImageWizard/steps/Repositories/components/ManageRepositoriesButton';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';

import RepositoryModal from './RepositoryModal';

import { usePackageRecommendations } from '../hooks/usePackageRecommendations';
import { usePackageSearchQueries } from '../hooks/usePackageSearchQueries';
import { usePackageSelection } from '../hooks/usePackageSelection';
import { useSearchAnalytics } from '../hooks/useSearchAnalytics';
import { getPackageDescription } from '../packagesUtilities';

type PackageSearchProps = {
  packageType: 'packages' | 'groups';
};

const PackageSearch = ({ packageType }: PackageSearchProps) => {
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const {
    transformedRecommendations,
    isLoadingRecommendations,
    isErrorRecommendations,
    recommendationsData,
  } = usePackageRecommendations(packageType);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeStream, setActiveStream] = useState('');
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

  const {
    onSelect,
    isPackageSelectDisabled,
    pendingRepoRec,
    setPendingRepoRec,
    selectedPackageKeys,
    selectedGroupNames,
  } = usePackageSelection({
    packageType,
    sortedPackages,
    transformedGroups,
    recommendationsData,
    setActiveStream,
  });

  const packageTypeLabel =
    packageType === 'packages' ? 'packages' : 'package groups';

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

  const composeSearchResults = () => {
    if (!debouncedSearchTerm && sortedPackages.length === 0) {
      return (
        <SelectOption isDisabled>
          Start typing to search {packageTypeLabel}
        </SelectOption>
      );
    }

    if (packageType === 'packages' && debouncedSearchTerm.length === 1) {
      return (
        <EmptyState variant='sm'>
          <EmptyStateBody>
            The search value must be greater than 1 character
          </EmptyStateBody>
        </EmptyState>
      );
    }

    if (isLoading) {
      return (
        <SelectOption isDisabled>Searching {packageTypeLabel}...</SelectOption>
      );
    }

    if (packageType === 'packages' && sortedPackages.length > 0) {
      return (
        <>
          {sortedPackages.slice(0, 50).map((pkg, index) => (
            <SelectOption
              key={`${pkg.name}-${pkg.stream || ''}-${index}`}
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
      );
    }

    if (packageType === 'groups' && transformedGroups.length > 0) {
      return transformedGroups.slice(0, 50).map((group, index) => (
        <SelectOption
          key={`${group.name}-${index}`}
          value={group.name}
          description={group.description}
        >
          {group.name}
        </SelectOption>
      ));
    }

    if (
      isLoadingRecommendations &&
      packageType === 'packages' &&
      !sortedPackages.length
    ) {
      return (
        <SelectOption isDisabled>
          Getting package recommendations...
        </SelectOption>
      );
    }

    if (!isSearchingOtherRepos && !isOnPremise) {
      return (
        <EmptyState variant='sm'>
          <EmptyStateBody>
            No results for &quot;{debouncedSearchTerm}&quot; in selected
            repositories. If you know the name of your repository, make sure
            it&apos;s included on the{' '}
            <ManageRepositoriesButton label='Repositories page' icon={true} />
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
      );
    }

    return (
      <SelectOption isDisabled>
        No {packageTypeLabel} found for &quot;{debouncedSearchTerm}
        &quot;
      </SelectOption>
    );
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
        pendingRepoRec={pendingRepoRec}
        setPendingRepoRec={setPendingRepoRec}
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
          <SelectList>{composeSearchResults()}</SelectList>
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
