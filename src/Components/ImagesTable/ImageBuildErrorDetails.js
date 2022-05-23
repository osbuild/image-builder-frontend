import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@patternfly/react-core';

const useGetErrorReason = (err) => {
  if (!err?.reason) {
    return 'An unknown error occured';
  }

  if (err.details?.reason) {
    return err.details.reason;
  }

  return err.reason;
};

const ErrorDetails = ({ status }) => {
  if (!status || status.status !== 'failure') {
    return <></>;
  }

  const reason = useGetErrorReason(status.error);

  return (
    <div className="pf-u-mt-sm">
      <strong>Status</strong>
      <Alert variant="danger" title="Image build failed" isInline isPlain />
      <p className="pf-u-danger-color-200 pf-u-w-33-on-md">{reason}</p>
    </div>
  );
};

ErrorDetails.propTypes = {
  status: PropTypes.object,
};

export default ErrorDetails;
