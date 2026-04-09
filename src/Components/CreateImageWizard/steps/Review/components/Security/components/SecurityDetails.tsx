import React from 'react';

import { useAppSelector } from '@/store/hooks';
import {
  selectCompliancePolicyTitle,
  selectComplianceProfileID,
  selectComplianceType,
} from '@/store/slices';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const SecurityDetails = ({ shouldHide }: Hideable) => {
  const complianceType = useAppSelector(selectComplianceType);
  const profile = useAppSelector(selectComplianceProfileID);
  const policy = useAppSelector(selectCompliancePolicyTitle);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading={
          complianceType === 'openscap'
            ? 'OpenSCAP profile'
            : 'Compliance policy'
        }
        description={profile ?? policy}
      />
      {
        // TODO: figure out how to check what items were added for the policy
      }
      <ReviewGroup heading='Added items' description={profile} />
    </>
  );
};
