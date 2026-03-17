import React from 'react';

import { FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';

import { useGetOscapCustomizationsQuery } from '@/store/api/backend';

import { useAppSelector } from '../../../../../store/hooks';
import { asDistribution } from '../../../../../store/typeGuards';
import {
  addKernelArg,
  removeKernelArg,
  selectComplianceProfileID,
  selectDistribution,
  selectKernel,
  setPendingKernelArgInput,
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { useKernelValidation } from '../../../utilities/useValidation';
import { isKernelArgumentValid } from '../../../validators';

const KernelArguments = () => {
  const kernel = useAppSelector(selectKernel);
  const kernelAppend = kernel.append;

  const stepValidation = useKernelValidation();

  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: asDistribution(release),
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const requiredByOpenSCAP = kernelAppend.filter((arg) =>
    oscapProfileInfo?.kernel?.append?.split(' ').includes(arg),
  );

  return (
    <FormGroup isRequired={false} label='Arguments'>
      <LabelInput
        ariaLabel='Add kernel argument'
        placeholder='Add kernel argument'
        validator={isKernelArgumentValid}
        list={kernelAppend.filter((arg) => !requiredByOpenSCAP.includes(arg))}
        requiredList={requiredByOpenSCAP}
        requiredCategoryName='Required by OpenSCAP'
        item='Kernel argument'
        addAction={addKernelArg}
        removeAction={removeKernelArg}
        stepValidation={stepValidation}
        fieldName='kernelAppend'
        addOnBlur={true}
        currentInputValue={kernel.pendingArgInput ?? ''}
        onInputValueChange={(value: string) =>
          setPendingKernelArgInput(value)
        }
      />
      <HelperText className='pf-v6-u-pt-sm'>
        <HelperTextItem>
          Enter additional kernel boot parameters. Examples: nomodeset or
          console=ttyS0.
        </HelperTextItem>
      </HelperText>
    </FormGroup>
  );
};

export default KernelArguments;
