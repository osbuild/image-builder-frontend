import React from 'react';

import { AWS_S3_EXPIRATION_TIME_IN_HOURS } from '@/constants';
import { ComposesResponseItem } from '@/store/api/backend';
import { computeHoursToExpiration } from '@/Utilities/time';

import Row from './Row';

import { AwsS3Details } from '../../ImageDetails';
import { AwsS3Instance } from '../../Instance';
import { ExpiringStatus } from '../../Status';

type AwsS3RowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

const AwsS3Row = ({
  compose,
  rowIndex,
  onSelect,
  isSelected,
}: AwsS3RowPropTypes) => {
  const hoursToExpiration = computeHoursToExpiration(compose.created_at);
  const awsS3ExpirationTime = AWS_S3_EXPIRATION_TIME_IN_HOURS;
  const isExpired = hoursToExpiration >= awsS3ExpirationTime;

  const details = <AwsS3Details compose={compose} />;
  const instance = <AwsS3Instance compose={compose} isExpired={isExpired} />;
  const status = (
    <ExpiringStatus
      compose={compose}
      isExpired={isExpired}
      timeToExpiration={hoursToExpiration}
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

export default AwsS3Row;
