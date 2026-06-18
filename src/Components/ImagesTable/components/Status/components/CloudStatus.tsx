import React from 'react';

import { Skeleton } from '@patternfly/react-core';

import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '@/store/api/backend';

import ErrorStatus from './ErrorStatus';
import ProgressStatus from './ProgressStatus';
import Status from './Status';

import { statuses } from '../statusConfig';

type CloudStatusPropTypes = {
  compose: ComposesResponseItem;
};

const CloudStatus = ({ compose }: CloudStatusPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  switch (data.image_status.status) {
    case 'failure': {
      return (
        <ErrorStatus
          icon={statuses['failure'].icon}
          text={statuses['failure'].text}
          error={data.image_status.error || ''}
        />
      );
    }
    case 'building':
      return <ProgressStatus status={data} />;
    default:
      return (
        <Status
          icon={statuses[data!.image_status.status].icon}
          text={statuses[data!.image_status.status].text}
        />
      );
  }
};

export default CloudStatus;
