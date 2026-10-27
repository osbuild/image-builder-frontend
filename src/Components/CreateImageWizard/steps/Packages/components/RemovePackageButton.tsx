import React from 'react';

import { Button, Tooltip } from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';

import { useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';
import { IBPackage, IBPackageGroup } from '@/store/slices/wizard';

import {
  useRemovePackageContent,
  useRequiredPackages,
} from '../hooks/usePackageHelpers';

type RemovePackageButtonProps = {
  item: IBPackage | IBPackageGroup;
};

const RemovePackageButton = ({ item }: RemovePackageButtonProps) => {
  const complianceType = useAppSelector(selectComplianceType);
  const { handleRemovePackage, handleRemoveGroup } = useRemovePackageContent();
  const requiredSet = useRequiredPackages();
  const isGroup = 'package_list' in item;
  const isRequired = !isGroup && requiredSet.has(item.name);
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
          ? handleRemoveGroup(item as IBPackageGroup)
          : handleRemovePackage(item as IBPackage)
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
