import React, { useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeAzureHyperVGeneration,
  selectAzureHyperVGeneration,
} from '@/store/slices/wizard';

import { HYPER_V_GENERATIONS } from '../constants';

const AzureHyperVSelect = () => {
  const dispatch = useAppDispatch();
  const hyperVGeneration = useAppSelector(selectAzureHyperVGeneration);
  const [isOpen, setIsOpen] = useState(false);

  const shortGenerationName =
    hyperVGeneration === 'V1' ? 'Generation 1 (BIOS)' : 'Generation 2 (UEFI)';

  const handleSelect = (
    _event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    if (selection === undefined) return;
    dispatch(changeAzureHyperVGeneration(selection as 'V1' | 'V2'));
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
    >
      {shortGenerationName}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired label='Hyper-V generation'>
      <Select
        isScrollable
        isOpen={isOpen}
        selected={hyperVGeneration}
        onSelect={handleSelect}
        onOpenChange={handleToggle}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          {HYPER_V_GENERATIONS.map((gen) => (
            <SelectOption key={gen.value} value={gen.value}>
              {gen.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default AzureHyperVSelect;
