import React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

type RemovePackageButtonProps = {
  item: IBPackageWithRepositoryInfo | GroupWithRepositoryInfo;
  onRemove: (
    item: IBPackageWithRepositoryInfo | GroupWithRepositoryInfo,
  ) => void;
};

const RemovePackageButton = ({ item, onRemove }: RemovePackageButtonProps) => {
  const packageType = 'package_list' in item ? 'package group' : 'package';

  return (
    <Button
      variant='plain'
      icon={<MinusCircleIcon />}
      aria-label={`Remove ${packageType}`}
      onClick={() => onRemove(item)}
      isInline
      hasNoPadding
    />
  );
};

export default RemovePackageButton;
