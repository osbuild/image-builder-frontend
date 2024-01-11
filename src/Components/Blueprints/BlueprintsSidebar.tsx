import React, { useState, Dispatch, SetStateAction } from 'react';

import { SearchInput } from '@patternfly/react-core';

import BlueprintCard from './BlueprintCard';

import { Blueprint } from '../../store/imageBuilderApiExperimental';

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

  return (
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
          <br />
        </>
      ))}
    </>
  );
};

export default BlueprintsSidebar;
