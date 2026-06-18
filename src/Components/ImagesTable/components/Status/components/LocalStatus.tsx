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

type LocalStatusPropTypes = {
  compose: ComposesResponseItem;
};

const LocalStatus = ({ compose }: LocalStatusPropTypes) => {
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

  const status = composeStatus.image_status.status;
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

export default LocalStatus;
