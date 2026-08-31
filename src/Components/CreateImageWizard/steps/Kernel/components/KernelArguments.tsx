import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { useKernelValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isKernelArgumentValid } from '@/Components/CreateImageWizard/validators';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  addKernelArg,
  removeKernelArg,
  selectKernel,
} from '@/store/slices/wizard';

const KernelArguments = () => {
  const kernelAppend = useAppSelector(selectKernel).append;

  const stepValidation = useKernelValidation();
  const { kernel: oscapKernel } = useSecuritySummary();

  return (
    <FormGroup isRequired={false} label='Arguments'>
      <LabelInput
        ariaLabel='Add kernel argument'
        placeholder='Add kernel argument'
        validator={isKernelArgumentValid}
        list={kernelAppend.filter((arg) => !oscapKernel.append.includes(arg))}
        requiredList={oscapKernel.append}
        item='Kernel argument'
        addAction={addKernelArg}
        removeAction={removeKernelArg}
        stepValidation={stepValidation}
        fieldName='kernelAppend'
        helperText='Enter additional kernel boot parameters. Examples: nomodeset or console=ttyS0.'
      />
    </FormGroup>
  );
};

export default KernelArguments;
