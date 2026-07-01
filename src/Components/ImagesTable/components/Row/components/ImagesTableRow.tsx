import React, { useEffect, useRef, useState } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME, STATUS_POLLING_INTERVAL } from '@/constants';
import { useGetUser } from '@/Hooks';
import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';

import AwsRow from './AwsRow';
import AwsS3Row from './AwsS3Row';
import AzureRow from './AzureRow';
import GcpRow from './GcpRow';
import LocalRow from './LocalRow';
import OciRow from './OciRow';

type ImagesTableRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  onSelect?: (blueprintId: string) => void;
  isSelected?: boolean;
};

const ImagesTableRow = ({
  compose,
  rowIndex,
  onSelect,
  isSelected,
}: ImagesTableRowPropTypes) => {
  const [pollingInterval, setPollingInterval] = useState(
    STATUS_POLLING_INTERVAL,
  );
  const lastTrackedStatusRef = useRef<string | null>(null);
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const { data: composeStatus } = useGetComposeStatusQuery(
    {
      composeId: compose.id,
    },
    { pollingInterval: pollingInterval },
  );

  useEffect(() => {
    if (
      composeStatus?.image_status.status === 'success' ||
      composeStatus?.image_status.status === 'failure'
    ) {
      setPollingInterval(0);
    } else {
      setPollingInterval(STATUS_POLLING_INTERVAL);
    }
  }, [setPollingInterval, composeStatus]);

  useEffect(() => {
    const currentStatus = composeStatus?.image_status.status;
    if (!isOnPremise && currentStatus) {
      if (lastTrackedStatusRef.current === null) {
        lastTrackedStatusRef.current = currentStatus;
        return;
      }

      const buildIsCompleted =
        currentStatus === 'success' || currentStatus === 'failure';
      const statusChanged = lastTrackedStatusRef.current !== currentStatus;

      if (buildIsCompleted && statusChanged) {
        lastTrackedStatusRef.current = currentStatus;
        const imageType = compose.request.image_requests[0]?.image_type;
        const uploadType =
          compose.request.image_requests[0]?.upload_request?.type;
        const isError = currentStatus === 'failure';
        const error = composeStatus.image_status.error;
        analytics.track(
          `${AMPLITUDE_MODULE_NAME} - Image Creation - ${isError ? 'Failure' : 'Success'}`,
          {
            module: AMPLITUDE_MODULE_NAME,
            error: isError,
            image_type: imageType,
            upload_type: uploadType,
            compose_id: compose.id,
            ...(isError
              ? {
                  error_id: error?.id,
                  error_details: error?.details,
                  error_reason: error?.reason,
                }
              : {}),
            account_id: userData?.identity.internal?.account_id || 'Not found',
          },
        );
      } else if (statusChanged) {
        lastTrackedStatusRef.current = currentStatus;
      }
    }
  }, [analytics, userData, compose, composeStatus]);

  const type = compose.request.image_requests[0]?.upload_request?.type;

  const rowProps = {
    compose,
    rowIndex,
    ...(onSelect && { onSelect }),
    ...(isSelected !== undefined && { isSelected }),
  };

  switch (type as string) {
    case 'aws':
      return <AwsRow {...rowProps} />;
    case 'gcp':
      return <GcpRow {...rowProps} />;
    case 'azure':
      return <AzureRow {...rowProps} />;
    case 'oci.objectstorage':
      return <OciRow {...rowProps} />;
    case 'aws.s3':
      return <AwsS3Row {...rowProps} />;
    case 'local':
      return <LocalRow {...rowProps} />;
  }
};

export default ImagesTableRow;
