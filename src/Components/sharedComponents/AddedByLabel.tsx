import React from 'react';

import { Label } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { ComplianceType } from '@/store/slices';

type AddedByLabelProps = {
  count: number;
  complianceType: ComplianceType;
};

const AddedByLabel = ({ count, complianceType }: AddedByLabelProps) => {
  return (
    count > 0 && (
      <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
        {count} Added by{' '}
        {complianceType === 'openscap' ? 'OpenSCAP' : 'compliance'}
      </Label>
    )
  );
};

export default AddedByLabel;
