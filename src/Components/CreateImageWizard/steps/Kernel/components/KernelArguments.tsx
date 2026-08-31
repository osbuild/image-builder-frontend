import React, { useMemo } from 'react';

import { FormGroup } from '@patternfly/react-core';

import ValidatedListInput from '@/Components/CreateImageWizard/ValidatedListInput';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addKernelArg,
  removeKernelArg,
  selectKernel,
  validateKernelArgs,
} from '@/store/slices/wizard';
import {
  type MergedListItem,
  mergeListItems,
} from '@/Utilities/mergeListItems';

const KernelArguments = () => {
  const dispatch = useAppDispatch();
  const kernelAppend = useAppSelector(selectKernel).append;
  const { kernel: requiredKernel } = useSecuritySummary();

  const items: MergedListItem[] = useMemo(
    () => mergeListItems(requiredKernel.append, kernelAppend),
    [kernelAppend, requiredKernel.append],
  );

  return (
    <FormGroup isRequired={false} label='Arguments'>
      <ValidatedListInput
        ariaLabel='Add kernel argument'
        placeholder='Add kernel argument'
        validator={validateKernelArgs}
        items={items}
        onAdd={(value) => dispatch(addKernelArg(value))}
        onRemove={(value) => dispatch(removeKernelArg(value))}
        helperText='Enter additional kernel boot parameters. Examples: nomodeset or console=ttyS0.'
      />
    </FormGroup>
  );
};

export default KernelArguments;
