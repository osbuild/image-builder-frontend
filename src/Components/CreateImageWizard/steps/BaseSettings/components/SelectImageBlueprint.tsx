import React, { useState } from 'react';

import {
  FormGroup,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeBlueprintId,
  selectBlueprintId,
} from '../../../../../store/wizardSlice';

const SelectImageBlueprint = () => {
  const dispatch = useAppDispatch();
  const blueprintId = useAppSelector(selectBlueprintId);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ) => {
    if (value === undefined) return;
    dispatch(changeBlueprintId(value as string));
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen((prev) => !prev)}
      isExpanded={isOpen}
    >
      {!blueprintId || blueprintId === 'none' ? 'None' : blueprintId}
    </MenuToggle>
  );

  return (
    <>
      <Title headingLevel='h2' size='lg'>
        Select image blueprint
      </Title>
      <FormGroup label='Blueprint' fieldId='select-blueprint'>
        <Select
          isOpen={isOpen}
          selected={blueprintId || 'none'}
          onSelect={handleSelect}
          onOpenChange={setIsOpen}
          toggle={toggle}
        >
          <SelectList>
            <SelectOption value='none'>None</SelectOption>
          </SelectList>
        </Select>
        <HelperText>
          <HelperTextItem>
            In order to see the image configuration in this dropdown, you must
            favorite it on the image table.
          </HelperTextItem>
        </HelperText>
      </FormGroup>
    </>
  );
};

export default SelectImageBlueprint;
