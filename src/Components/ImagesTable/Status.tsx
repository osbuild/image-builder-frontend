import React, { useEffect, useState } from 'react';

import './ImageBuildStatus.scss';
import {
  Alert,
  Button,
  CodeBlock,
  CodeBlockCode,
  Content,
  Flex,
  Icon,
  Panel,
  PanelMain,
  Popover,
  Skeleton,
  Spinner,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CopyIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OffIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';

import {
  AMPLITUDE_MODULE_NAME,
  AWS_S3_EXPIRATION_TIME_IN_HOURS,
  OCI_STORAGE_EXPIRATION_TIME_IN_DAYS,
} from '../../constants';
import { useGetComposeStatusQuery } from '../../store/backendApi';
import { CockpitComposesResponseItem } from '../../store/cockpit/types';
import {
  ClonesResponseItem,
  ComposesResponseItem,
  ComposeStatus,
  ComposeStatusError,
  UploadStatus,
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
          error={`Failed to share image to ${clone.request.region}`}
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
  compose: ComposesResponseItem | CockpitComposesResponseItem;
};

export const AwsDetailsStatus = ({ compose }: ComposeStatusPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });
  const { analytics } = useChrome();

  if (!isSuccess) {
    return <></>;
  }

  switch (data?.image_status.status) {
    case 'failure': {
      if (!process.env.IS_ON_PREMISE) {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Created`, {
          module: AMPLITUDE_MODULE_NAME,
          error: true,
          error_id: data.image_status.error?.id,
          error_details: data.image_status.error?.details,
          error_reason: data.image_status.error?.reason,
        });
      }
      return (
        <ErrorStatus
          icon={statuses[data.image_status.status].icon}
          text={statuses[data.image_status.status].text}
          error={data.image_status.error || ''}
        />
      );
    }

    default:
      return (
        <Status
          icon={statuses[data!.image_status.status].icon}
          text={statuses[data!.image_status.status].text}
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
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);
  const { analytics, auth } = useChrome();
  useEffect(() => {
    (async () => {
      const data = await auth?.getUser();
      setUserData(data);
    })();
  }, [auth]);
  if (!isSuccess) {
    return <Skeleton />;
  }

  switch (data?.image_status.status) {
    case 'failure': {
      if (!process.env.IS_ON_PREMISE) {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Created`, {
          module: AMPLITUDE_MODULE_NAME,
          error: true,
          error_id: data.image_status.error?.id,
          error_details: data.image_status.error?.details,
          error_reason: data.image_status.error?.reason,
          account_id: userData?.identity.internal?.account_id || 'Not found',
        });
      }
      return (
        <ErrorStatus
          icon={statuses['failure'].icon}
          text={statuses['failure'].text}
          error={data.image_status.error || ''}
        />
      );
    }
    default:
      return (
        <Status
          icon={statuses[data!.image_status.status].icon}
          text={statuses[data!.image_status.status].text}
        />
      );
  }
};

type AzureStatusPropTypes = {
  status: ComposeStatus;
};

export const AzureStatus = ({ status }: AzureStatusPropTypes) => {
  const { analytics } = useChrome();

  switch (status.image_status.status) {
    case 'failure': {
      if (!process.env.IS_ON_PREMISE) {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Created`, {
          module: AMPLITUDE_MODULE_NAME,
          error: true,
          error_id: status.image_status.error?.id,
          error_details: status.image_status.error?.details,
          error_reason: status.image_status.error?.reason,
        });
      }
      return (
        <ErrorStatus
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
          error={status.image_status.error || ''}
        />
      );
    }
    default:
      return (
        <Status
          icon={statuses[status.image_status.status].icon}
          text={statuses[status.image_status.status].text}
        />
      );
  }
};

type ExpiringStatusPropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
  timeToExpiration: number;
};

export const ExpiringStatus = ({
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

  const status = composeStatus!.image_status.status;
  const remainingHours = AWS_S3_EXPIRATION_TIME_IN_HOURS - timeToExpiration;
  const remainingDays = OCI_STORAGE_EXPIRATION_TIME_IN_DAYS - timeToExpiration;

  const imageType = compose.request.image_requests[0].upload_request.type;

  if (isExpired) {
    return (
      <Status icon={statuses['expired'].icon} text={statuses['expired'].text} />
    );
  }

  if (imageType === 'aws.s3' && status === 'success') {
    const text = `Expires in ${remainingHours} ${
      remainingHours > 1 ? 'hours' : 'hour'
    }`;
    return (
      <Status
        icon={statuses['expiring'].icon}
        text={
          <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-warning">
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
          <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-warning">
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
        error={composeStatus?.image_status.error || ''}
      />
    );
  }

  return <Status icon={statuses[status].icon} text={statuses[status].text} />;
};

type LocalStatusPropTypes = {
  compose: ComposesResponseItem;
};

export const LocalStatus = ({ compose }: LocalStatusPropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const status = composeStatus?.image_status.status || 'failure';

  if (status === 'failure') {
    return (
      <ErrorStatus
        icon={statuses[status].icon}
        text={statuses[status].text}
        error={composeStatus?.image_status.error || ''}
      />
    );
  }
  return <Status icon={statuses[status].icon} text={statuses[status].text} />;
};

const statuses = {
  failure: {
    icon: (
      <Icon status="danger">
        <ExclamationCircleIcon />
      </Icon>
    ),
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-danger">
        Image build failed
      </span>
    ),
  },

  pending: {
    icon: <PendingIcon />,
    text: (
      <span className="pf-v6-u-font-weight-bold">Image build is pending</span>
    ),
  },

  building: {
    icon: <Spinner isInline />,
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info">
        Image build in progress
      </span>
    ),
  },

  uploading: {
    icon: <Spinner isInline />,
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info">
        Image upload in progress
      </span>
    ),
  },

  registering: {
    icon: <Spinner isInline />,
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info">
        Cloud registration in progress
      </span>
    ),
  },

  running: {
    icon: <Spinner isInline />,
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info">
        Running
      </span>
    ),
  },

  success: {
    icon: (
      <Icon status="success">
        <CheckCircleIcon />
      </Icon>
    ),
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-success">
        Ready
      </span>
    ),
  },

  expired: {
    icon: <OffIcon />,
    text: <span className="pf-v6-u-font-weight-bold">Expired</span>,
  },

  expiring: {
    icon: (
      <Icon status="warning">
        <ExclamationTriangleIcon />
      </Icon>
    ),
  },

  failureSharing: {
    icon: (
      <Icon status="danger">
        <ExclamationCircleIcon />
      </Icon>
    ),
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-danger">
        Sharing image failed
      </span>
    ),
  },

  failedClone: {
    icon: (
      <Icon status="danger">
        <ExclamationCircleIcon />
      </Icon>
    ),
    text: (
      <span className="pf-v6-u-font-weight-bold pf-v6-u-text-color-status-danger">
        Failure sharing
      </span>
    ),
  },
};

type StatusPropTypes = {
  icon: JSX.Element;
  text: JSX.Element;
};

const Status = ({ icon, text }: StatusPropTypes) => {
  return (
    <Flex className="pf-v6-u-align-items-baseline pf-m-nowrap">
      <div className="pf-v6-u-mr-sm">{icon}</div>
      <p>{text}</p>
    </Flex>
  );
};

type ErrorStatusPropTypes = {
  icon: JSX.Element;
  text: JSX.Element;
  error: ComposeStatusError | string;
};

const ErrorStatus = ({ icon, text, error }: ErrorStatusPropTypes) => {
  let reason = '';
  const detailsArray: string[] = [];
  if (typeof error === 'string') {
    reason = error;
  } else {
    if (error.reason) {
      reason = error.reason;
    }
    if (Array.isArray(error.details)) {
      for (const line in error.details) {
        detailsArray.push(`${error.details[line]}`);
      }
    }
    if (typeof error.details === 'string') {
      detailsArray.push(error.details);
    }
    if (error.details?.reason) {
      detailsArray.push(`${error.details.reason}`);
    }
  }

  return (
    <Flex className="pf-v6-u-align-items-baseline pf-m-nowrap">
      <div className="pf-v6-u-mr-sm">{icon}</div>
      <Popover
        data-testid="errorstatus-popover"
        position="bottom"
        minWidth="40rem"
        bodyContent={
          <>
            <Alert variant="danger" title={text} isInline isPlain />
            <Content component="p" className="pf-v6-u-pt-md pf-v6-u-pb-md">
              {reason}
            </Content>
            <Panel isScrollable>
              <PanelMain maxHeight="25rem">
                <CodeBlock>
                  <CodeBlockCode>{detailsArray.join('\n')}</CodeBlockCode>
                </CodeBlock>
              </PanelMain>
            </Panel>
            <Button
              icon={<CopyIcon />}
              variant="link"
              onClick={() =>
                navigator.clipboard.writeText(
                  reason + '\n\n' + detailsArray.join('\n')
                )
              }
              className="pf-v6-u-pl-0 pf-v6-u-mt-md"
            >
              Copy error text to clipboard
            </Button>
          </>
        }
      >
        <Button variant="link" className="pf-v6-u-p-0 pf-v6-u-font-size-sm">
          <div className="failure-button">{text}</div>
        </Button>
      </Popover>
    </Flex>
  );
};
