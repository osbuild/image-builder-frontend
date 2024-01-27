import React, { useState, useCallback } from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  SearchInput,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';
import debounce from 'lodash/debounce';

import BlueprintCard from './BlueprintCard';

import {
  useGetBlueprintsQuery,
  BlueprintItem,
} from '../../store/imageBuilderApi';

type blueprintProps = {
  selectedBlueprint: string | undefined;
  setSelectedBlueprint: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

type blueprintSearchProps = {
  filter: string | undefined;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  blueprintsTotal: number;
};

type emptyBlueprintStateProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentClass<SVGIconProps, any>;
  action: React.ReactNode;
  titleText: string;
  bodyText: string;
};

const BlueprintsSidebar = ({
  selectedBlueprint,
  setSelectedBlueprint,
}: blueprintProps) => {
  const [blueprintsSearchQuery, setBlueprintsSearchQuery] = useState<
    string | undefined
  >();
  const debouncedSearch = useCallback(
    debounce((filter) => {
      setBlueprintsSearchQuery(filter.length > 0 ? filter : undefined);
    }, 300),
    [setBlueprintsSearchQuery]
  );
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  const { data: blueprintsData, isLoading } = useGetBlueprintsQuery({
    search: blueprintsSearchQuery,
  });
  const blueprints = blueprintsData?.data;

  const blueprintsTotal = blueprintsData?.meta?.count || 0;

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  if (blueprintsTotal === 0 && blueprintsSearchQuery === undefined) {
    return (
      <EmptyBlueprintState
        icon={PlusCircleIcon}
        action={<Button>Create</Button>}
        titleText="No blueprints yet"
        bodyText="To get started, create a blueprint."
      />
    );
  }

  return (
    <>
      <Stack hasGutter>
        {(blueprintsTotal > 0 || blueprintsSearchQuery !== undefined) && (
          <>
            <StackItem>
              <BlueprintSearch
                filter={blueprintsSearchQuery}
                setFilter={debouncedSearch}
                blueprintsTotal={blueprintsTotal}
              />
            </StackItem>
            <StackItem>
              <Button
                isBlock
                onClick={() => setSelectedBlueprint(undefined)}
                variant="link"
                isDisabled={!selectedBlueprint}
              >
                Show all images
              </Button>
            </StackItem>
          </>
        )}
        {blueprintsTotal === 0 && (
          <EmptyBlueprintState
            icon={SearchIcon}
            action={
              <Button variant="link" onClick={() => debouncedSearch('')}>
                Clear all filters
              </Button>
            }
            titleText="No blueprints found"
            bodyText="No blueprints match your search criteria. Try a different search."
          />
        )}
        {blueprintsTotal > 0 &&
          blueprints?.map((blueprint: BlueprintItem) => (
            <StackItem key={blueprint.id}>
              <BlueprintCard
                blueprint={blueprint}
                selectedBlueprint={selectedBlueprint}
                setSelectedBlueprint={setSelectedBlueprint}
              />
            </StackItem>
          ))}
      </Stack>
    </>
  );
};

const BlueprintSearch = ({
  filter,
  setFilter,
  blueprintsTotal,
}: blueprintSearchProps) => {
  const onChange = (value: string) => {
    setFilter(value);
  };

  return (
    <SearchInput
      value={filter}
      placeholder="Search by name or description"
      onChange={(_event, value) => onChange(value)}
      onClear={() => onChange('')}
      resultsCount={`${blueprintsTotal} blueprints`}
    />
  );
};

const EmptyBlueprintState = ({
  titleText,
  bodyText,
  icon,
  action,
}: emptyBlueprintStateProps) => (
  <EmptyState variant="sm">
    <EmptyStateHeader
      titleText={titleText}
      headingLevel="h4"
      icon={<EmptyStateIcon icon={icon} />}
    />
    <EmptyStateBody>{bodyText}</EmptyStateBody>
    <EmptyStateFooter>
      <EmptyStateActions>{action}</EmptyStateActions>
    </EmptyStateFooter>
  </EmptyState>
);

export default BlueprintsSidebar;
