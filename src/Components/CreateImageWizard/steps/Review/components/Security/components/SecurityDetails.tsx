import React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';

import { ReviewGroup } from '../../shared';
import type { Hideable } from '../../types';
import { isSecurityConfigured, SecuritySummary } from '../types';

type SecurityDetailProps = Hideable & {
  security?: SecuritySummary | undefined;
};

export const SecurityDetails = ({
  shouldHide,
  security,
}: SecurityDetailProps) => {
  const complianceType = useAppSelector(selectComplianceType);

  if (shouldHide || !isSecurityConfigured(security)) {
    return null;
  }

  const { title, packages, services } = security;
  return (
    <>
      <ReviewGroup
        heading={
          complianceType === 'openscap'
            ? 'OpenSCAP profile'
            : 'Compliance policy'
        }
        description={title}
      />
      {(packages.length > 0 || services.total > 0) && (
        <ReviewGroup
          heading='Added items'
          description={
            <LabelGroup aria-label='Compliance added items'>
              {packages.length > 0 && <Label>{packages.length} packages</Label>}
              {services.total > 0 && <Label>{services.total} services</Label>}
            </LabelGroup>
          }
        />
      )}
    </>
  );
};
