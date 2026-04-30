import React from 'react';

import { Button, Tooltip } from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';

import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../packagesTypes';

type RemovePackageButtonProps = {
  item: IBPackageWithRepositoryInfo | GroupWithRepositoryInfo;
  isRequired?: boolean;
  onRemove: (
    item: IBPackageWithRepositoryInfo | GroupWithRepositoryInfo,
  ) => void;
};

const RemovePackageButton = ({
  item,
  isRequired,
  onRemove,
}: RemovePackageButtonProps) => {
  const packageType = 'package_list' in item ? 'package group' : 'package';

  const button = (
    <Button
      isDisabled={!!isRequired}
      variant='plain'
      icon={isRequired ? <LockIcon /> : <MinusCircleIcon />}
      aria-label={
        isRequired
          ? `Required ${packageType}, cannot be removed`
          : `Remove ${packageType}`
      }
      onClick={() => onRemove(item)}
      isInline
      hasNoPadding
    />
  );

  if (!isRequired) {
    return button;
  }

  return (
    <Tooltip content='Required by the selected OpenSCAP profile'>
      <span>{button}</span>
    </Tooltip>
  );
};

export default RemovePackageButton;
