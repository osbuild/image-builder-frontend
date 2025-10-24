import React from 'react';

import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const CustomEpelWarning = () => (
  <Tooltip content='Custom EPEL repositories will stop being snapshotted. Please use the community EPEL repositories instead.'>
    <Icon status='warning' isInline className={spacing.mlSm}>
      <ExclamationTriangleIcon />
    </Icon>
  </Tooltip>
);

export default CustomEpelWarning;
