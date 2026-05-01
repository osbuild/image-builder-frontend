import React, { ReactElement, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { ARCHES } from '@/constants';
import { ImageRequest } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { changeArchitecture, selectArchitecture } from '@/store/slices/wizard';

type ArchSelectProps = {
  isDisabled?: boolean;
};

const ArchSelect = ({ isDisabled = false }: ArchSelectProps) => {
  const arch = useAppSelector(selectArchitecture);
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [isOpen, setIsOpen] = useState(false);

  const setArch = (_event?: React.MouseEvent, selection?: string | number) => {
    if (selection === undefined) return;
    dispatch(changeArchitecture(selection as ImageRequest['architecture']));
    setIsOpen(false);
  };

  const setSelectOptions = () => {
    const options: ReactElement[] = [];
    const arches = ARCHES.filter((a) => {
      // we don't want to support cross-arch
      // builds for on-prem for now
      if (isOnPremise) {
        return a === arch;
      }
      return true;
    });
    arches.forEach((arch) => {
      options.push(
        <SelectOption key={arch} value={arch}>
          {arch}
        </SelectOption>,
      );
    });

    return options;
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      style={
        {
          minWidth: '8rem',
          maxWidth: '100%',
        } as React.CSSProperties
      }
      data-testid='arch_select'
    >
      {arch}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={true} label='Architecture'>
      <Select
        isOpen={isOpen}
        selected={arch}
        onSelect={setArch}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>{setSelectOptions()}</SelectList>
      </Select>
    </FormGroup>
  );
};

export default ArchSelect;
