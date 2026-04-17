import React, { useState } from 'react';

import { FormGroup } from '@patternfly/react-core';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core/dist/esm';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeKernelName, selectKernel } from '@/store/slices/wizard';

const NONE_OPTION = 'None';
const kernelOptions = ['kernel', 'kernel-debug'];

const KernelName = () => {
  const dispatch = useAppDispatch();
  const kernel = useAppSelector(selectKernel).name;

  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event?: React.MouseEvent, value?: string | number) => {
    if (value && typeof value === 'string') {
      if (value === NONE_OPTION) {
        dispatch(changeKernelName(''));
      } else {
        dispatch(changeKernelName(value));
      }
      setIsOpen(false);
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      {kernel || 'Select default kernel'}
    </MenuToggle>
  );

  return (
    <FormGroup isRequired={false} label='Kernel package'>
      <Select
        isScrollable
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        selected={kernel}
        onSelect={onSelect}
        toggle={toggle}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>
          <SelectOption key={NONE_OPTION} value={NONE_OPTION}>
            {NONE_OPTION}
          </SelectOption>
          {kernelOptions.map((option) => (
            <SelectOption key={option} value={option}>
              {option}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default KernelName;
