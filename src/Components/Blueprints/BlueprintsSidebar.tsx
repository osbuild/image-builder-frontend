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
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

import BlueprintCard from './BlueprintCard';

import { Blueprint } from '../../store/imageBuilderApiExperimental';
import { Link } from 'react-router-dom';
import { resolveRelPath } from '../../Utilities/path';

interface blueprintProps {
  blueprints: Blueprint[];
  selectedBlueprint: string;
  setSelectedBlueprint: Dispatch<SetStateAction<string>>;
}
const BlueprintsSidebar = (props: blueprintProps) => {
  const [blueprintFilter, setBlueprintFilter] = useState('');

  const onChange = (value: string) => {
    setBlueprintFilter(value);
  };

  const filteredBlueprints = props.blueprints?.filter(
    (blueprint: Blueprint) => {
      return blueprint.name
        .toLowerCase()
        .includes(blueprintFilter.toLowerCase());
    }
  );

  const blueprintsEmpty = (
    <EmptyState>
      <EmptyStateHeader
        titleText="Create a blueprint"
        headingLevel="h4"
        icon={<EmptyStateIcon icon={CubesIcon} />}
      />
      <EmptyStateFooter>
        <EmptyStateActions>
          <Link
            to={resolveRelPath('blueprintwizard')}
            className="pf-c-button pf-m-primary pf-u-mr-md"
            data-testid="create-blueprint-action"
          >
            Create
          </Link>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  return props.blueprints?.length ? (
    <>
      <SearchInput
        placeholder="Search by blueprint name"
        value={blueprintFilter}
        onChange={(_event, value) => onChange(value)}
        onClear={() => onChange('')}
        className="pf-v5-u-mb-md"
      />
      {filteredBlueprints?.map((blueprint: Blueprint) => (
        <>
          <BlueprintCard
            key={blueprint.id}
            blueprint={blueprint}
            selectedBlueprint={props.selectedBlueprint}
            setSelectedBlueprint={props.setSelectedBlueprint}
          />
        </>
      ))}
    </>
  ) : (
    blueprintsEmpty
  );
};

export default BlueprintsSidebar;
