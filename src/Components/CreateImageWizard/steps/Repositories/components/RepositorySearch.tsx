import React, { useState } from 'react';

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

import { ContentOrigin } from '@/constants';
import {
  ApiRepositoryResponseRead,
  useListRepositoriesQuery,
} from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectArchitecture, selectDistribution } from '@/store/slices';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import useDebounce from '@/Utilities/useDebounce';

import RepositoryLabel from './RepositoryLabel';

import {
  excludeEUSReposFilter,
  useIsRepoDisabled,
} from '../repositoriesUtilities';

const ORIGIN_PARAM = [
  ContentOrigin.CUSTOM,
  ContentOrigin.COMMUNITY,
  ContentOrigin.REDHAT,
].join(',');

type RepositorySearchProps = {
  onSelectRepository: (repo: ApiRepositoryResponseRead) => void;
  onRemoveRepository: (repo: ApiRepositoryResponseRead) => void;
  selectedRepoIds: Set<string>;
};

const RepositorySearch = ({
  onSelectRepository,
  onRemoveRepository,
  selectedRepoIds,
}: RepositorySearchProps) => {
  const arch = useAppSelector(selectArchitecture);
  const distribution = useAppSelector(selectDistribution);
  const version = releaseToVersion(distribution);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const debouncedFilterValue = useDebounce(filterValue);

  const { data: { data: repositories = [] } = {}, isFetching } =
    useListRepositoriesQuery(
      {
        availableForArch: arch,
        availableForVersion: version,
        ...excludeEUSReposFilter,
        contentType: 'rpm',
        origin: ORIGIN_PARAM,
        limit: 50,
        offset: 0,
        search: debouncedFilterValue,
      },
      {
        skip: !isOpen,
      },
    );

  const checkRepoDisabled = useIsRepoDisabled(
    repositories,
    selectedRepoIds,
    isFetching,
  );

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (value && typeof value === 'string') {
      const selectedRepo = repositories.find((repo) => repo.uuid === value);
      if (selectedRepo) {
        const isSelected = selectedRepoIds.has(value);
        if (isSelected) {
          onRemoveRepository(selectedRepo);
        } else {
          onSelectRepository(selectedRepo);
        }
        setInputValue('');
        setFilterValue('');
        setIsOpen(false);
      }
    }
  };

  const onTextInputChange = (_event: React.FormEvent, value: string) => {
    setInputValue(value);
    setFilterValue(value);
    setIsOpen(true);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onClearButtonClick = () => {
    setInputValue('');
    setFilterValue('');
    setIsOpen(false);
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
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          isExpanded={isOpen}
          icon={<SearchIcon />}
          aria-label='Filter repositories'
          placeholder='Search and add repositories'
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
      selected={Array.from(selectedRepoIds)}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusFirstItemOnOpen={false}
    >
      <SelectList>
        {isFetching ? (
          <SelectOption isDisabled>Loading repositories...</SelectOption>
        ) : repositories.length > 0 ? (
          repositories.map((repo) => {
            const [isDisabled, disabledReason] = checkRepoDisabled(repo);

            return (
              <SelectOption
                key={repo.uuid}
                value={repo.uuid}
                isDisabled={isDisabled}
                description={
                  isDisabled
                    ? disabledReason
                    : repo.package_count
                      ? `${repo.package_count} packages`
                      : undefined
                }
              >
                <span>
                  {repo.name}
                  <RepositoryLabel origin={repo.origin} url={repo.url || ''} />
                </span>
              </SelectOption>
            );
          })
        ) : debouncedFilterValue ? (
          <SelectOption isDisabled>
            No repositories found for &quot;{debouncedFilterValue}&quot;
          </SelectOption>
        ) : (
          <SelectOption isDisabled>No repositories available</SelectOption>
        )}
      </SelectList>
    </Select>
  );
};

export default RepositorySearch;
