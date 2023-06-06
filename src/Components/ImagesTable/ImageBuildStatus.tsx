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
  apiSlice,
  useGetClonesQuery,
  useGetCloneStatusQuery,
  useGetComposeStatusQuery,
} from '../../store/apiSlice';
import { hoursToExpiration } from '../../Utilities/time';

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

// Custom hook to get the statuses of all clones of a compose
// TODO clean this up and get it working with skip
export const useGetClonesStatuses = (argclones) => {
  console.log('in useGetClonesStatuses, argclones: ', argclones);
  const dispatch = useDispatch();

  // This is how it is now working instead of skip
  // TODO add skip or do this?
  const clones = argclones ? argclones : [];
  console.log('clones: ', clones);

  // why is this in a useEffect hook?
  useEffect(() => {
    const statuses = clones.map((clone) => {
      return dispatch(apiSlice.endpoints.getCloneStatus.initiate(clone.id));
    });

    // why do we need to unsubscribe?
    return () => {
      statuses.forEach((status) => {
        status.unsubscribe();
      });
    };
  }, [clones]);

  // what does this do?
  return useSelector((state) => {
    return clones.map((clone) => {
      return apiSlice.endpoints.getCloneStatus.select(clone.id)(state);
    });
  });
};

export const CloneStatus = ({ cloneId }) => {
  const { data: status, isSuccess } = useGetCloneStatusQuery(cloneId);

  useGetCloneStatusQuery(cloneId, {
    pollingInterval:
      status?.status === 'success' || status?.status === 'failure'
        ? false
        : 8000,
  });

  return isSuccess ? <Status status={status.status} /> : null;
};

export const ComposeStatus = ({ composeId }) => {
  const { data: composeStatus, isSuccess } =
    useGetComposeStatusQuery(composeId);

  const status = composeStatus?.image_status.status;

  useGetComposeStatusQuery(composeId, {
    pollingInterval:
      status === 'success' || status === 'failure' ? false : 8000,
  });

  return isSuccess ? <Status status={status} /> : null;
};

// TODO: this is still doing the 'flip' thing where it shows the wrong status for a second
const useGetParentStatus = (compose) => {
  const store = useStore();

  const { data: composeStatus } = useGetComposeStatusQuery(compose.id);
  const { data: clones, isSuccess } = useGetClonesQuery(compose.id);
  const cloneStatuses = useGetClonesStatuses(clones);
  console.log('cloneStatuses: ', cloneStatuses);

  const statuses = new Set();
  statuses.add(composeStatus?.status);
  for (const cloneStatus of cloneStatuses) {
    statuses.add(cloneStatus.data?.status);
  }

  if (statuses.has('failure')) {
    return 'failure';
  } else if (statuses.has('building')) {
    return 'building';
  } else if (statuses.has('uploading')) {
    return 'uploading';
  } else if (statuses.has('registering')) {
    return 'registering';
  } else if (statuses.has('running')) {
    return 'running';
  } else if (statuses.has('pending')) {
    return 'pending';
  } else if (statuses.has('success')) {
    return 'success';
  } else {
    return '';
  }
};

type ImageBuildStatusProps = {
  // TODO bad bad bad!!!
  compose: any 
}

export const ImageBuildStatus = ({ compose }: ImageBuildStatusProps) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery(
    compose.id
  );

  const type = composeStatus?.image_status?.upload_status?.type;

  let status = composeStatus?.image_status.status;

  if (type === 'aws.s3' && status === 'success') {
    // Cloud API currently reports expired images status as 'success'
    status =
      hoursToExpiration(compose.createdAt) >= AWS_S3_EXPIRATION_TIME_IN_HOURS
        ? 'expired'
        : 'expiring';
  }

  // TODO tomorrow...
  // cannot call a hook inside a conditional
  // probably need to factor these out into their own components
  console.log('type: ', type);
  if (type === 'aws') {
    console.log('parent stuff');
    status = useGetParentStatus(compose);
  }

  return isSuccess ? <Status status={status} image={compose} /> : null;
};

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
