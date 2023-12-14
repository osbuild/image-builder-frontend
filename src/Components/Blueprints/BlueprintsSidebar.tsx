/* eslint-disable no-console */
import React, { useState } from 'react';

import { SearchInput } from '@patternfly/react-core';

import BlueprintCard from './BlueprintCard';

import { useGetBlueprintsQuery } from '../../store/imageBuilderApiExperimental';
import { Blueprint } from '../../store/imageBuilderApiExperimental';

const BlueprintsSidebar: React.FunctionComponent = () => {
  const { data: blueprints } = useGetBlueprintsQuery('');
  const [blueprintFilter, setBlueprintFilter] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState('');

  const onChange = (value: string) => {
    setBlueprintFilter(value);
  };

  const filteredBlueprints = blueprints?.filter((blueprint: Blueprint) => {
    return blueprint.name.toLowerCase().includes(blueprintFilter.toLowerCase());
  });

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
            selectedBlueprint={selectedBlueprint}
            setSelectedBlueprint={setSelectedBlueprint}
          />
          <br />
        </>
      ))}
    </>
  );
};

export default BlueprintsSidebar;
