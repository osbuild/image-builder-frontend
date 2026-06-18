import React from 'react';

import { ComposeStatus } from '@/store/api/backend';

import ErrorStatus from './ErrorStatus';
import ProgressStatus from './ProgressStatus';
import Status from './Status';

import { statuses } from '../statusConfig';

type AzureStatusPropTypes = {
  status: ComposeStatus;
};

const AzureStatus = ({ status }: AzureStatusPropTypes) => {
  switch (status.image_status.status) {
    case 'failure': {
      return (
        <ErrorStatus
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
          error={status.image_status.error || ''}
        />
      );
    }
    case 'building':
      return <ProgressStatus status={status} />;
    default:
      return (
        <Status
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
        />
      );
  }
};

export default AzureStatus;
