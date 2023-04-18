import React from 'react';

import { Button } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

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
      <p>{reason}</p>
      <Button
        variant="link"
        onClick={() => navigator.clipboard.writeText(reason)}
        className="pf-u-pl-0 pf-u-mt-md"
      >
        Copy error text to clipboard <CopyIcon />
      </Button>
    </div>
  );
};

ErrorDetails.propTypes = {
  status: PropTypes.object,
};

export default ErrorDetails;
