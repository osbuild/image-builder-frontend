import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../../store/imageBuilderApi';
import {
  addKernelArg,
  removeKernelArg,
  selectComplianceProfileID,
  selectDistribution,
  selectKernel,
} from '../../../../../store/wizardSlice';
import ChippingInput from '../../../ChippingInput';
import { isKernelArgumentValid } from '../../../validators';

const KernelArguments = () => {
  const kernelAppend = useAppSelector(selectKernel).append;

  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    }
  );

  const requiredByOpenSCAP = kernelAppend.filter((arg) =>
    oscapProfileInfo?.kernel?.append?.split(' ').includes(arg)
  );

  const notRequiredByOpenSCAP = kernelAppend.filter(
    (arg) => !oscapProfileInfo?.kernel?.append?.split(' ').includes(arg)
  );

  return (
    <FormGroup isRequired={false} label="Append">
      <ChippingInput
        ariaLabel="Add kernel argument"
        placeholder="Add kernel argument"
        validator={isKernelArgumentValid}
        list={notRequiredByOpenSCAP}
        requiredList={requiredByOpenSCAP}
        item="Kernel argument"
        addAction={addKernelArg}
        removeAction={removeKernelArg}
      />
    </FormGroup>
  );
};

export default KernelArguments;
