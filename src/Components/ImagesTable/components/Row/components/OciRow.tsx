import React from 'react';

import { OciLaunchModal } from '@/Components/Launch/OciLaunchModal';
import { OCI_STORAGE_EXPIRATION_TIME_IN_DAYS } from '@/constants';
import { ComposesResponseItem } from '@/store/api/backend';
import { computeHoursToExpiration } from '@/Utilities/time';

import Row from './Row';

import { OciDetails } from '../../ImageDetails';
import { ExpiringStatus } from '../../Status';

type OciRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

const OciRow = ({
  compose,
  rowIndex,
  onSelect,
  isSelected,
}: OciRowPropTypes) => {
  const daysToExpiration = Math.floor(
    computeHoursToExpiration(compose.created_at) / 24,
  );
  const isExpired = daysToExpiration >= OCI_STORAGE_EXPIRATION_TIME_IN_DAYS;

  const details = <OciDetails compose={compose} />;
  const instance = <OciLaunchModal compose={compose} isExpired={isExpired} />;
  const status = (
    <ExpiringStatus
      compose={compose}
      isExpired={isExpired}
      timeToExpiration={daysToExpiration}
    />
  );

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      instance={instance}
      status={status}
      {...(onSelect && { onSelect })}
      {...(isSelected !== undefined && { isSelected })}
    />
  );
};

export default OciRow;
