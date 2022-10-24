import React from 'react';
import PropTypes from 'prop-types';

import { Flex } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  OffIcon,
  PendingIcon,
} from '@patternfly/react-icons';

import './ImageBuildStatus.scss';
import { useSelector } from 'react-redux';
import {
  selectImageById,
  selectImageStatusesById,
} from '../../store/composesSlice';
import { hoursToExpiration } from '../../Utilities/time';
import { AWS_S3_EXPIRATION_TIME_IN_HOURS } from '../../constants';

export const ImageBuildStatus = ({ imageId }) => {
  const image = useSelector((state) => selectImageById(state, imageId));

  const remainingHours =
    AWS_S3_EXPIRATION_TIME_IN_HOURS - hoursToExpiration(image.created_at);

  // Messages appear in order of priority
  const messages = {
    failure: [
      {
        icon: <ExclamationCircleIcon className="error" />,
        text: 'Image build failed',
        priority: 6,
      },
    ],
    pending: [
      {
        icon: <PendingIcon />,
        text: 'Image build is pending',
        priority: 2,
      },
    ],
    // Keep "running" for backward compatibility
    running: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Image build in progress',
        priority: 1,
      },
    ],
    building: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Image build in progress',
        priority: 3,
      },
    ],
    uploading: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Image upload in progress',
        priority: 4,
      },
    ],
    registering: [
      {
        icon: <InProgressIcon className="pending" />,
        text: 'Cloud registration in progress',
        priority: 5,
      },
    ],
    success: [
      {
        icon: <CheckCircleIcon className="success" />,
        text: 'Ready',
        priority: 0,
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

  let status;
  if (image.imageType === 'aws') {
    const imageStatuses = useSelector((state) =>
      selectImageStatusesById(state, image.id)
    );
    const filteredImageStatuses = imageStatuses.filter(
      (imageStatus) => imageStatus !== undefined
    );
    if (filteredImageStatuses.length === 0) {
      status = image.status;
    } else {
      status = filteredImageStatuses.reduce((prev, current) => {
        return messages[prev][0].priority > messages[current][0].priority
          ? prev
          : current;
      });
    }
  } else if (image.uploadType === 'aws.s3' && image.status === 'success') {
    // Cloud API currently reports expired images status as 'success'
    status =
      hoursToExpiration(image.created_at) >= AWS_S3_EXPIRATION_TIME_IN_HOURS
        ? 'expired'
        : 'expiring';
  } else {
    status = image.status;
  }

  return (
    <React.Fragment>
      {messages[status] &&
        messages[status].map((message, key) => (
          <Flex key={key} className="pf-u-align-items-baseline pf-m-nowrap">
            <div className="pf-u-mr-sm">{message.icon}</div>
            {message.text}
          </Flex>
        ))}
    </React.Fragment>
  );
};

ImageBuildStatus.propTypes = {
  imageId: PropTypes.string,
};
