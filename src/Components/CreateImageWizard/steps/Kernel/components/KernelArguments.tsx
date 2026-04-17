import React from 'react';

import { FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { useKernelValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isKernelArgumentValid } from '@/Components/CreateImageWizard/validators';
import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import {
  addKernelArg,
  removeKernelArg,
  selectComplianceProfileID,
  selectDistribution,
  selectKernel,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';

const KernelArguments = () => {
  const kernelAppend = useAppSelector(selectKernel).append;

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
        item='Kernel argument'
        addAction={addKernelArg}
        removeAction={removeKernelArg}
        stepValidation={stepValidation}
        fieldName='kernelAppend'
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
