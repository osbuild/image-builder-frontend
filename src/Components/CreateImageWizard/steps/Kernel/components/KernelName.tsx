import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeKernelName,
  selectKernel,
} from '../../../../../store/wizardSlice';
import { useKernelValidation } from '../../../utilities/useValidation';
import { HookValidatedInput } from '../../../ValidatedTextInput';

const KernelName = () => {
  const dispatch = useAppDispatch();
  const kernel = useAppSelector(selectKernel);

  const stepValidation = useKernelValidation();

  const handleChange = (e: React.FormEvent, value: string) => {
    dispatch(changeKernelName(value));
  };

  return (
    <FormGroup isRequired={false} label="Name">
      <HookValidatedInput
        ariaLabel="kernel input"
        value={kernel.name}
        onChange={handleChange}
        placeholder="Add a kernel name"
        stepValidation={stepValidation}
        fieldName="kernel"
      />
    </FormGroup>
  );
};

export default KernelName;
