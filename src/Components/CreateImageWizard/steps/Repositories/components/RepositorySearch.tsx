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

import { ContentOrigin } from '@/constants';
import {
  ApiRepositoryResponseRead,
  useListRepositoriesQuery,
} from '@/store/api/contentSources';
import { useAppSelector } from '@/store/hooks';
import { selectArchitecture, selectDistribution } from '@/store/slices';
import { releaseToVersion } from '@/Utilities/releaseToVersion';
import useDebounce from '@/Utilities/useDebounce';
import { useFlag } from '@/Utilities/useGetEnvironment';

import CommunityRepositoryLabel from './CommunityRepositoryLabel';
import CustomEpelWarning from './CustomEpelWarning';
import UploadRepositoryLabel from './UploadRepositoryLabel';

import { isEPELUrl, isRepoDisabled } from '../repositoriesUtilities';

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

  const isLayeredReposEnabled = useFlag('image-builder.layered-repos.enabled');

  const originParam = useMemo(() => {
    const origins = [ContentOrigin.CUSTOM];
    origins.push(ContentOrigin.COMMUNITY);
    if (isLayeredReposEnabled) origins.push(ContentOrigin.REDHAT);
    return origins.join(',');
  }, [isLayeredReposEnabled]);

  const debouncedFilterValue = useDebounce(filterValue);

  const { data: { data: repositories = [] } = {}, isFetching } =
    useListRepositoriesQuery(
      {
        availableForArch: arch,
        availableForVersion: version,
        contentType: 'rpm',
        origin: originParam,
        limit: 50,
        offset: 0,
        search: debouncedFilterValue,
      },
      {
        skip: !debouncedFilterValue,
      },
    );

  const onInputClick = () => {
    if (!isOpen && inputValue) {
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

  const getRepositoryLabel = (repo: ApiRepositoryResponseRead) => {
    if (repo.origin === ContentOrigin.UPLOAD) {
      return <UploadRepositoryLabel />;
    } else if (repo.origin === ContentOrigin.COMMUNITY) {
      return <CommunityRepositoryLabel />;
    } else if (isEPELUrl(repo.url!)) {
      return <CustomEpelWarning />;
    }
    return null;
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
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          autoComplete='off'
          isExpanded={isOpen}
          icon={<SearchIcon />}
          aria-label='Filter repositories'
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
        {!debouncedFilterValue ? (
          <SelectOption isDisabled>
            Start typing to search repositories
          </SelectOption>
        ) : isFetching ? (
          <SelectOption isDisabled>Searching repositories...</SelectOption>
        ) : repositories.length > 0 ? (
          repositories.map((repo) => {
            const isSelected = selectedRepoIds.has(repo.uuid || '');
            const [isDisabled, disabledReason] = isRepoDisabled(
              repo,
              isSelected,
              isFetching,
              repositories,
              selectedRepoIds,
            );

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
                  {getRepositoryLabel(repo)}
                </span>
              </SelectOption>
            );
          })
        ) : (
          <SelectOption isDisabled>
            No repositories found for &quot;{debouncedFilterValue}&quot;
          </SelectOption>
        )}
      </SelectList>
    </Select>
  );
};

export default RepositorySearch;
