import React from 'react';

import { Button, Tooltip } from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';

import { useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '@/store/slices/wizard';

import { useRemovePackageContent } from '../packagesUtilities';

type RemovePackageButtonProps = {
  item: IBPackageWithRepositoryInfo | GroupWithRepositoryInfo;
  isRequired?: boolean;
};

const RemovePackageButton = ({
  item,
  isRequired,
}: RemovePackageButtonProps) => {
  const complianceType = useAppSelector(selectComplianceType);
  const { handleRemovePackage, handleRemoveGroup } = useRemovePackageContent();
  const isGroup = 'package_list' in item;
  const packageType = isGroup ? 'package group' : 'package';

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
      onClick={() =>
        isGroup
          ? handleRemoveGroup(item as GroupWithRepositoryInfo)
          : handleRemovePackage(item as IBPackageWithRepositoryInfo)
      }
      isInline
      hasNoPadding
    />
  );

  if (!isRequired) {
    return button;
  }

  return (
    <Tooltip
      content={
        complianceType === 'openscap'
          ? 'Required by the selected OpenSCAP profile'
          : 'Required by the selected compliance policy'
      }
    >
      <span>{button}</span>
    </Tooltip>
  );
};

export default RemovePackageButton;
