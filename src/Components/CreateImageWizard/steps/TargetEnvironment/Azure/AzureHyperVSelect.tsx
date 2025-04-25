import React, { useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      data-testid="azure-hyper-v-generation-select"
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
    >
      {hyperVGeneration === 'V1' ? 'Generation 1' : 'Generation 2'}
    </MenuToggle>
  );

  return (
    <>
      <FormGroup isRequired label="HyperV Generation">
        <Select
          isScrollable
          isOpen={isOpen}
          selected={hyperVGeneration === 'V1' ? 'Generation 1' : 'Generation 2'}
          onSelect={handleSelect}
          onOpenChange={handleToggle}
          toggle={toggle}
          shouldFocusFirstItemOnOpen={false}
        >
          <SelectList>{selectOptions}</SelectList>
        </Select>
      </FormGroup>
    </>
  );
};
