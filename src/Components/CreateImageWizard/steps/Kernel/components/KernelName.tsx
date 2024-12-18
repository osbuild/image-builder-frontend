import React, { useState } from 'react';

import { FormGroup } from '@patternfly/react-core';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core/dist/esm';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeKernelName,
  selectKernel,
} from '../../../../../store/wizardSlice';

const kernelOptions = ['kernel', 'kernel-debug'];

const KernelName = () => {
  const dispatch = useAppDispatch();
  const kernel = useAppSelector(selectKernel);

  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent, value: string) => {
    if (value === 'default') {
      dispatch(changeKernelName(''));
    } else {
      dispatch(changeKernelName(value));
    }
    setIsOpen(false);
  };

  const defaultOption = () => {
    return (
      <SelectOption key="default" value="default">
        Default kernel package
      </SelectOption>
    );
  };

  const prepareSelectOptions = () => {
    const kernelSelectOptions = kernelOptions.map((option) => (
      <SelectOption key={option} value={option}>
        {option}
      </SelectOption>
    ));

    if (kernel.name) {
      return [defaultOption()].concat(kernelSelectOptions);
    } else return kernelSelectOptions;
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      isFullWidth
      data-testid="kernel-name-dropdown"
    >
      {kernel.name}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label="Name">
      <Select
        isScrollable
        isOpen={isOpen}
        selected={kernel.name}
        onSelect={onSelect}
        onOpenChange={onToggle}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>{prepareSelectOptions()}</SelectList>
      </Select>
    </FormGroup>
  );
};

export default KernelName;
