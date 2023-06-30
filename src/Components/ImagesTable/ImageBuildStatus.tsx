import {useEffect} from 'react';

import {
  Alert,
  Button,
  Flex,
  Panel,
  PanelMain,
  Popover,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  OffIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import './ImageBuildStatus.scss';
import { useDispatch, useSelector, useStore } from 'react-redux';

import ErrorDetails from './ImageBuildErrorDetails';

import { AWS_S3_EXPIRATION_TIME_IN_HOURS } from '../../constants';
import {
  useGetClonesQuery,
  useGetCloneStatusQuery,
  useGetComposeStatusQuery,
} from '../../store/apiSlice';
import { hoursToExpiration } from '../../Utilities/time';
import {ImageStatus} from '../../../types';

// TODO use this
// const cloneErrorMessage = () => {
//   let region = '';
//   hasFailedClone.includes(image.id)
//     ? (region = 'one or more regions')
//     : (region = imageRegion);
//   return {
//     error: {
//       reason: `Failed to share image to ${region}.`,
//     },
//     status: 'failure',
//   };
// };

export const CloneStatus = ({ cloneId, cloneStatuses }) => {
  const { data: status, isSuccess } = useGetCloneStatusQuery(cloneId);

  useGetCloneStatusQuery(cloneId, {
    pollingInterval:
      status?.status === 'success' || status?.status === 'failure'
        ? undefined
        : 8000,
  });

  cloneStatuses.push(status?.status);

  return isSuccess ? <Status status={status.status} /> : null;
};

export const ComposeStatus = ({ composeId, cloneStatuses }) => {
  const { data: composeStatus, isSuccess } =
    useGetComposeStatusQuery(composeId);

  const status = composeStatus?.image_status.status;

  useGetComposeStatusQuery(composeId, {
    pollingInterval:
      status === 'success' || status === 'failure' ? undefined : 8000,
  });

  cloneStatuses.push(status?.status);

  return isSuccess ? <Status status={status} /> : null;
};

type ImageBuildStatusProps = {
  // TODO bad bad bad!!!
  compose: any,
  cloneStatuses: []
}

export const ImageBuildStatus = ({ compose, cloneStatuses }: ImageBuildStatusProps) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery(
    compose.id
  );

  const type = composeStatus?.image_status?.upload_status?.type;

  let status = composeStatus?.image_status.status;

  // if (type === 'aws.s3' && status === 'success') {
  //   // Cloud API currently reports expired images status as 'success'
  //   status =
  //     hoursToExpiration(compose.createdAt) >= AWS_S3_EXPIRATION_TIME_IN_HOURS
  //       ? 'expired'
  //       : 'expiring';
  // }

  if (!isSuccess) {
    return null;
  } else if (type === 'aws.s3' && status === 'success') {
    return null;
  } else if (type === 'aws') {
    // return <AWSStatus composeStatus={status} cloneStatuses={cloneStatuses}/>
    return null;
  }   
  return <Status status={status} image={compose} />;
};

type AWSStatusProps = {
  composeId: string,
  cloneStatuses: { string: ImageStatus } 
}

const AWSStatus = ({composeId, cloneStatuses}: AWSStatusProps) => {
  const { data: composeStatus, isSuccess: isSuccessComposeStatus } = useGetComposeStatusQuery(composeId);
  const { data: clones, isSuccess: isSuccessClones } = useGetClonesQuery(composeId);

  const statuses = Object.values(cloneStatuses);

  // Ensure all clone statuses have been loaded before rendering to prevent
  if (!isSuccessComposeStatus || !isSuccessClones || statuses.length !== clones.meta.count) {
    return null;
  }
  
  // Clones are only allowed for successful parent composes
  if (composeStatus?.image_status.status !== 'success' || clones.meta.count === 0) {
    return <p>{composeStatus?.image_status.status}</p>;
  }

  if (statuses.includes('failure')) {
    return <Status status='failure />;
  } else if (statuses.includes('building')) {
    return <p>building</p>;
  } else if (statuses.includes('uploading')) {
    return <p>uploading</p>;
  } else if (statuses.includes('registering')) {
    return <p>registering</p>;
  } else if (statuses.includes('running')) {
    return <p>running</p>;
  } else if (statuses.includes('pending')) {
    return <p>pending</p>;
  } else if (statuses.includes('success')) {
    return <p>success</p>;
  } else {
    return null;
  }
}

const Status = ({ status, image }) => {
  const remainingHours =
    AWS_S3_EXPIRATION_TIME_IN_HOURS - hoursToExpiration(image?.createdAt);

  const messages = {
    failure: [
      {
        icon: <ExclamationCircleIcon className="error" />,
        text: 'Image build failed',
      },
    ],
    pending: [
      {
        icon: <PendingIcon />,
        text: 'Image build is pending',
      },
    ],
    // Keep "running" for backward compatibility
    running: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Image build in progress',
      },
    ],
    building: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Image build in progress',
      },
    ],
    uploading: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Image upload in progress',
      },
    ],
    registering: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Cloud registration in progress',
      },
    ],
    success: [
      {
        icon: <CheckCircleIcon className="success" />,
        text: 'Ready',
      },
    ],
    expiring: [
      {
        icon: <ExclamationTriangleIcon className="expiring" />,
        text: `Expires in ${remainingHours} ${
          remainingHours > 1 ? 'hours' : 'hour'
        }`,
      },
    ],
    expired: [
      {
        icon: <OffIcon />,
        text: 'Expired',
      },
    ],
  };

  return (
    <>
      {messages[status] &&
        messages[status].map((message, key) => (
          <Flex key={key} className="pf-u-align-items-baseline pf-m-nowrap">
            <div className="pf-u-mr-sm">{message.icon}</div>
            {status === 'failure' ? (
              <Popover
                position="bottom"
                minWidth="30rem"
                bodyContent={
                  <>
                    <Alert
                      variant="danger"
                      title="Image build failed"
                      isInline
                      isPlain
                    />
                    <Panel isScrollable>
                      <PanelMain maxHeight="25rem">
                        <ErrorDetails
                          status={{ status: 'failure', error: 'bad stuff' }}
                        />
                      </PanelMain>
                    </Panel>
                  </>
                }
              >
                <Button variant="link" className="pf-u-p-0 pf-u-font-size-sm">
                  <div className="failure-button">{message.text}</div>
                </Button>
              </Popover>
            ) : (
              message.text
            )}
          </Flex>
        ))}
    </>
  );
};
