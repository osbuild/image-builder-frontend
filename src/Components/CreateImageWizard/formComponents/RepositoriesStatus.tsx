import React from 'react';

import { Alert, Button, Popover } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';

import { ApiRepositoryResponse } from '../../../store/contentSourcesApi';

type RepositoryStatusProps = {
  repoStatus: ApiRepositoryResponse['status'];
  repoUrl: ApiRepositoryResponse['url'];
};

const RepositoriesStatus = ({ repoStatus, repoUrl }: RepositoryStatusProps) => {
  if (repoStatus === 'Valid') {
    return (
      <>
        <CheckCircleIcon className="success" /> {repoStatus}
      </>
    );
  } else if (repoStatus === 'Invalid') {
    return (
      <>
        <Popover
          position="bottom"
          minWidth="30rem"
          bodyContent={
            <>
              <Alert variant="danger" title="Invalid" isInline isPlain />
              Cannot fetch {repoUrl}
            </>
          }
        >
          <Button variant="link" className="pf-u-p-0 pf-u-font-size-sm">
            <ExclamationCircleIcon className="error" />{' '}
            <span className="failure-button">{repoStatus}</span>
          </Button>
        </Popover>
      </>
    );
  } else if (repoStatus === 'Unavailable') {
    return (
      <>
        <Popover
          position="bottom"
          minWidth="30rem"
          bodyContent={
            <>
              <Alert variant="warning" title="Unavailable" isInline isPlain />
              Cannot fetch {repoUrl}
            </>
          }
        >
          <Button variant="link" className="pf-u-p-0 pf-u-font-size-sm">
            <ExclamationTriangleIcon className="expiring" />{' '}
            <span className="failure-button">{repoStatus}</span>
          </Button>
        </Popover>
      </>
    );
  } else if (repoStatus === 'Pending') {
    return (
      <>
        <InProgressIcon className="pending" /> {repoStatus}
      </>
    );
  }
};

export default RepositoriesStatus;
