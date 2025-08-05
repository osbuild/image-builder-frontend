import React from 'react';

import { Label, Tooltip } from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';

import ManageRepositoriesButton from './ManageRepositoriesButton';

const UploadRepositoryLabel = () => {
  return (
    <Tooltip
      content={
        <>
          Upload repository: Snapshots will only be taken when new content is
          uploaded.
          <ManageRepositoriesButton />
        </>
      }
    >
      <Label
        variant='outline'
        isCompact
        icon={<UploadIcon />}
        style={{ marginLeft: '8px' }}
      >
        Upload
      </Label>
    </Tooltip>
  );
};

export default UploadRepositoryLabel;
