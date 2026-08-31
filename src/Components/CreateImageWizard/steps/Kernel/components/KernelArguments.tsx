import React, { useMemo } from 'react';

import { FormGroup } from '@patternfly/react-core';

import TextInputGroup from '@/Components/CreateImageWizard/TextInputGroup';
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
  const { kernel: oscapKernel } = useSecuritySummary();

  const items: MergedListItem[] = useMemo(
    () => mergeListItems(oscapKernel.append, kernelAppend),
    [kernelAppend, oscapKernel.append],
  );

  return (
    <FormGroup isRequired={false} label='Arguments'>
      <TextInputGroup
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
