import React from 'react';

import {
  ComposerComposesResponseItem,
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '@/store/api/backend';

import ErrorStatus from './ErrorStatus';
import ProgressStatus from './ProgressStatus';
import Status from './Status';

import { statuses } from '../statusConfig';

type AwsDetailsStatusProps = {
  compose: ComposesResponseItem | ComposerComposesResponseItem;
};

const AwsDetailsStatus = ({ compose }: AwsDetailsStatusProps) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <></>;
  }

  switch (data.image_status.status) {
    case 'failure': {
      return (
        <ErrorStatus
          icon={statuses[data.image_status.status].icon}
          text={statuses[data.image_status.status].text}
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

export default AwsDetailsStatus;
