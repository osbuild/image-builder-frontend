import React, { useState, Dispatch, SetStateAction } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import BlueprintCard from './BlueprintCard';

import { BlueprintItem } from '../../store/imageBuilderApi';

type blueprintProps = {
  blueprints: BlueprintItem[] | undefined;
  selectedBlueprint: string;
  setSelectedBlueprint: Dispatch<SetStateAction<string>>;
};

const BlueprintsSidebar = ({
  blueprints,
  selectedBlueprint,
  setSelectedBlueprint,
}: blueprintProps) => {
  const [blueprintFilter, setBlueprintFilter] = useState('');

  const onChange = (value: string) => {
    setBlueprintFilter(value);
  };

  const emptyBlueprints = (
    <EmptyState variant="sm">
      <EmptyStateHeader
        titleText="No blueprints yet"
        headingLevel="h4"
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
      />
      <EmptyStateBody>To get started, create a blueprint.</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button>Create</Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  if (blueprints === undefined || blueprints?.length === 0) {
    return emptyBlueprints;
  }

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <SearchInput
            placeholder="Search by name or description"
            value={blueprintFilter}
            onChange={(_event, value) => onChange(value)}
            onClear={() => onChange('')}
          />
        </StackItem>
        {blueprints.map((blueprint: BlueprintItem) => (
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

export default BlueprintsSidebar;
