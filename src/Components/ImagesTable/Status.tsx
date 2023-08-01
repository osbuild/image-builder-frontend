import React from 'react';

import './ImageBuildStatus.scss';
import {
  Alert,
  Button,
  Flex,
  Panel,
  PanelMain,
  Popover,
  Skeleton,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CopyIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  OffIcon,
  PendingIcon,
} from '@patternfly/react-icons';

import { AWS_S3_EXPIRATION_TIME_IN_HOURS } from '../../constants';
import {
  ClonesResponseItem,
  ComposeStatus,
  ComposesResponseItem,
  UploadStatus,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';

type StatusClonePropTypes = {
  clone: ClonesResponseItem;
  status: UploadStatus | undefined;
};

export const StatusClone = ({ clone, status }: StatusClonePropTypes) => {
  switch (status?.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses.failureSharing.icon}
          text={statuses.failureSharing.text}
          reason={`Failed to share image to ${clone.request.region}`}
        />
      );
    case 'success':
    case 'running':
    case 'pending':
      return (
        <Status
          icon={statuses[status.status].icon}
          text={statuses[status.status].text}
        />
      );
    default:
      return <></>;
  }
};

type ComposeStatusPropTypes = {
  compose: ComposesResponseItem;
};

export const AwsDetailsStatus = ({ compose }: ComposeStatusPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <></>;
  }

  switch (data.image_status.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses[data.image_status.status].icon}
          text={statuses[data.image_status.status].text}
          reason={data?.image_status?.error?.details?.reason || ''}
        />
      );
    default:
      return (
        <Status
          icon={statuses[data.image_status.status].icon}
          text={statuses[data.image_status.status].text}
        />
      );
  }
};

type CloudStatusPropTypes = {
  compose: ComposesResponseItem;
};

export const CloudStatus = ({ compose }: CloudStatusPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  switch (data.image_status.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses['failure'].icon}
          text={statuses['failure'].text}
          reason={data.image_status.error?.details?.reason || ''}
        />
      );
    default:
      return (
        <Status
          icon={statuses[data.image_status.status].icon}
          text={statuses[data.image_status.status].text}
        />
      );
  }
};

type AzureStatusPropTypes = {
  status: ComposeStatus;
};

export const AzureStatus = ({ status }: AzureStatusPropTypes) => {
  switch (status.image_status.status) {
    case 'failure':
      return (
        <ErrorStatus
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
          reason={status.image_status.error?.reason || ''}
        />
      );
    default:
      return (
        <Status
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
        />
      );
  }
};

type AwsS3StatusPropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
  hoursToExpiration: number;
};

export const AwsS3Status = ({
  compose,
  isExpired,
  hoursToExpiration,
}: AwsS3StatusPropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const status = composeStatus.image_status.status;
  const remainingTime = AWS_S3_EXPIRATION_TIME_IN_HOURS - hoursToExpiration;

  if (isExpired) {
    return (
      <Status icon={statuses['expired'].icon} text={statuses['expired'].text} />
    );
  } else if (status === 'success') {
    return (
      <Status
        icon={statuses['expiring'].icon}
        text={`Expires in ${remainingTime} ${
          remainingTime > 1 ? 'hours' : 'hour'
        }`}
      />
    );
  } else {
    return <Status icon={statuses[status].icon} text={statuses[status].text} />;
  }
};

const statuses = {
  failure: {
    icon: <ExclamationCircleIcon className="error" />,
    text: 'Image build failed',
  },

  pending: {
    icon: <PendingIcon />,
    text: 'Image build is pending',
  },

  building: {
    icon: <InProgressIcon className="pending" />,
    text: 'Image build in progress',
  },

  uploading: {
    icon: <InProgressIcon className="pending" />,
    text: 'Image upload in progress',
  },

  registering: {
    icon: <InProgressIcon className="pending" />,
    text: 'Cloud registration in progress',
  },

  running: {
    icon: <InProgressIcon className="pending" />,
    text: 'Running',
  },

  success: {
    icon: <CheckCircleIcon className="success" />,
    text: 'Ready',
  },

  expired: {
    icon: <OffIcon />,
    text: 'Expired',
  },

  expiring: {
    icon: <ExclamationTriangleIcon className="expiring" />,
  },

  failureSharing: {
    icon: <ExclamationCircleIcon className="error" />,
    text: 'Sharing image failed',
  },

  failedClone: {
    icon: <ExclamationCircleIcon className="error" />,
    text: 'Failure sharing',
  },
};

type StatusPropTypes = {
  icon: JSX.Element;
  text: string;
};

const Status = ({ icon, text }: StatusPropTypes) => {
  return (
    <Flex className="pf-u-align-items-baseline pf-m-nowrap">
      <div className="pf-u-mr-sm">{icon}</div>
      <p>{text}</p>
    </Flex>
  );
};

type ErrorStatusPropTypes = {
  icon: JSX.Element;
  text: string;
  reason: string;
};

const ErrorStatus = ({ icon, text, reason }: ErrorStatusPropTypes) => {
  return (
    <Flex className="pf-u-align-items-baseline pf-m-nowrap">
      <div className="pf-u-mr-sm">{icon}</div>
      <Popover
        position="bottom"
        minWidth="30rem"
        bodyContent={
          <>
            <Alert variant="danger" title={text} isInline isPlain />
            <Panel isScrollable>
              <PanelMain maxHeight="25rem">
                <div className="pf-u-mt-sm">
                  <p>{reason}</p>
                  <Button
                    variant="link"
                    onClick={() => navigator.clipboard.writeText(reason)}
                    className="pf-u-pl-0 pf-u-mt-md"
                  >
                    Copy error text to clipboard <CopyIcon />
                  </Button>
                </div>
              </PanelMain>
            </Panel>
          </>
        }
      >
        <Button variant="link" className="pf-u-p-0 pf-u-font-size-sm">
          <div className="failure-button">{text}</div>
        </Button>
      </Popover>
    </Flex>
  );
};
