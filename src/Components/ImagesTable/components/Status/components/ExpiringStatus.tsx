import React from 'react';

import { Skeleton } from '@patternfly/react-core';

import {
  AWS_S3_EXPIRATION_TIME_IN_HOURS,
  OCI_STORAGE_EXPIRATION_TIME_IN_DAYS,
} from '@/constants';
import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '@/store/api/backend';

import ErrorStatus from './ErrorStatus';
import ProgressStatus from './ProgressStatus';
import Status from './Status';

import { statuses } from '../statusConfig';

type ExpiringStatusPropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
  timeToExpiration: number;
};

const ExpiringStatus = ({
  compose,
  isExpired,
  timeToExpiration,
}: ExpiringStatusPropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!composeStatus.image_status.status) {
    return (
      <ErrorStatus
        icon={statuses['failure'].icon}
        text={statuses['failure'].text}
        error={composeStatus.image_status.error || ''}
      />
    );
  }

  const status = composeStatus!.image_status.status;
  const awsS3ExpirationTime = AWS_S3_EXPIRATION_TIME_IN_HOURS;
  const remainingHours = awsS3ExpirationTime - timeToExpiration;
  const remainingDays = OCI_STORAGE_EXPIRATION_TIME_IN_DAYS - timeToExpiration;

  const imageType = compose.request.image_requests[0].upload_request.type;

  if (isExpired) {
    return (
      <Status icon={statuses['expired'].icon} text={statuses['expired'].text} />
    );
  }

  if (imageType === 'aws.s3' && status === 'success') {
    const remainingDaysForAws = Math.floor(remainingHours / 24);
    const text =
      remainingHours >= 24
        ? `Expires in ${remainingDaysForAws} ${
            remainingDaysForAws > 1 ? 'days' : 'day'
          }`
        : `Expires in ${remainingHours} ${
            remainingHours > 1 ? 'hours' : 'hour'
          }`;
    return (
      <Status
        icon={statuses['expiring'].icon}
        text={
          <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-warning'>
            {text}
          </span>
        }
      />
    );
  }

  if (imageType === 'oci.objectstorage' && status === 'success') {
    const text = `Expires in ${remainingDays} ${
      remainingDays > 1 ? 'days' : 'day'
    }`;
    return (
      <Status
        icon={statuses['expiring'].icon}
        text={
          <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-warning'>
            {text}
          </span>
        }
      />
    );
  }

  if (status === 'failure') {
    return (
      <ErrorStatus
        icon={statuses[status].icon}
        text={statuses[status].text}
        error={composeStatus.image_status.error || ''}
      />
    );
  }

  if (status === 'building') {
    return <ProgressStatus status={composeStatus} />;
  }

  return <Status icon={statuses[status].icon} text={statuses[status].text} />;
};

export default ExpiringStatus;
