import React from 'react';

import { Label, Tooltip } from '@patternfly/react-core';
import { RepositoryIcon } from '@patternfly/react-icons';

import ManageRepositoriesButton from './ManageRepositoriesButton';

const CommunityRepositoryLabel = () => {
  return (
    <Tooltip
      content={
        <>
          Community repository: This EPEL repository is shared across
          organizations.
          <ManageRepositoriesButton />
        </>
      }
    >
      <Label
        variant='outline'
        isCompact
        icon={<RepositoryIcon />}
        style={{ marginLeft: '8px' }}
      >
        Community
      </Label>
    </Tooltip>
  );
};

export default CommunityRepositoryLabel;
