import React, { useState } from 'react';

import { FormGroup } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAzureHyperVGeneration,
  selectAzureHyperVGeneration,
} from '../../../../../store/wizardSlice';

export const AzureHyperVSelect = () => {
  const hyperVGeneration = useAppSelector(selectAzureHyperVGeneration);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (_event: React.MouseEvent, selection: 'V1' | 'V2') => {
    dispatch(changeAzureHyperVGeneration(selection));
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const selectOptions = [
    <SelectOption
      key="V1"
      value="V1"
      description="Hyper V Generation 1 (BIOS)"
      label="Hyper V Generation 1"
    />,
    <SelectOption
      key="V2"
      value="V2"
      description="Hyper V Generation 2 (UEFI)"
      label="Hyper V Generation 2"
    />,
  ];

  return (
    <>
      <FormGroup
        isRequired
        label="HyperV Generation"
        data-testid="azure-hyper-v-generation-select"
      >
        <Select
          ouiaId="hyperv_gen_select"
          variant={SelectVariant.single}
          onToggle={handleToggle}
          onSelect={handleSelect}
          isOpen={isOpen}
          selections={
            hyperVGeneration === 'V1' ? 'Generation 1' : 'Generation 2'
          }
          value={hyperVGeneration}
        >
          {selectOptions}
        </Select>
      </FormGroup>
    </>
  );
};
