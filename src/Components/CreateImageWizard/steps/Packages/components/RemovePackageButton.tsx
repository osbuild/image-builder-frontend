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
  return (
    <Button
      variant='plain'
      icon={<MinusCircleIcon />}
      aria-label='Remove package'
      onClick={() => onRemove(item)}
      isInline
      hasNoPadding
    />
  );
};

export default RemovePackageButton;
