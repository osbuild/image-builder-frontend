import React from 'react';

import { Icon, Spinner } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  OffIcon,
  PendingIcon,
} from '@patternfly/react-icons';

export const statuses = {
  failure: {
    icon: (
      <Icon status='danger'>
        <ExclamationCircleIcon />
      </Icon>
    ),
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-danger'>
        Image build failed
      </span>
    ),
  },

  pending: {
    icon: <PendingIcon />,
    text: (
      <span className='pf-v6-u-font-weight-bold'>Image build is pending</span>
    ),
  },

  building: {
    icon: <Spinner isInline />,
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info'>
        Image build in progress
      </span>
    ),
  },

  uploading: {
    icon: <Spinner isInline />,
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info'>
        Image upload in progress
      </span>
    ),
  },

  registering: {
    icon: <Spinner isInline />,
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info'>
        Cloud registration in progress
      </span>
    ),
  },

  running: {
    icon: <Spinner isInline />,
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-info'>
        Running
      </span>
    ),
  },

  success: {
    icon: (
      <Icon status='success'>
        <CheckCircleIcon />
      </Icon>
    ),
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-success'>
        Ready
      </span>
    ),
  },

  expired: {
    icon: <OffIcon />,
    text: <span className='pf-v6-u-font-weight-bold'>Expired</span>,
  },

  expiring: {
    icon: (
      <Icon status='warning'>
        <ExclamationTriangleIcon />
      </Icon>
    ),
  },

  failureSharing: {
    icon: (
      <Icon status='danger'>
        <ExclamationCircleIcon />
      </Icon>
    ),
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-danger'>
        Sharing image failed
      </span>
    ),
  },

  failedClone: {
    icon: (
      <Icon status='danger'>
        <ExclamationCircleIcon />
      </Icon>
    ),
    text: (
      <span className='pf-v6-u-font-weight-bold pf-v6-u-text-color-status-danger'>
        Failure sharing
      </span>
    ),
  },
};
