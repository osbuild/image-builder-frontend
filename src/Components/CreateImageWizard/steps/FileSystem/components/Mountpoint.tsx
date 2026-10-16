import React, { useEffect, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';
import {
  changePartitionMountpoint,
  FilesystemPartition,
  MountpointDiskPartition,
  selectBlueprintMode,
  selectFscMode,
  selectMountpoints,
  validateMountpoint,
  validateMountpointList,
} from '@/store/slices/wizard';

type MountpointProps = {
  partition: FilesystemPartition | MountpointDiskPartition;
  isOscapRequired?: boolean;
};

const Mountpoint = ({ partition, isOscapRequired }: MountpointProps) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectFscMode);
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const complianceType = useAppSelector(selectComplianceType);
  const mountpoints = useAppSelector(selectMountpoints);
  const [mountpoint, setMountpoint] = useState(partition.mountpoint ?? '');

  useEffect(() => {
    // Reset the mountpoint when the partition changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountpoint(partition.mountpoint ?? '');
  }, [partition.mountpoint]);

  const hasOneRoot =
    mode === 'basic' &&
    partition.mountpoint === '/' &&
    mountpoints.filter((m) => m.mountpoint === '/').length === 1;

  const isDisabled =
    isOscapRequired ||
    ('fs_type' in partition && partition.fs_type === 'swap') ||
    hasOneRoot;

  const tooltipContent = isOscapRequired
    ? complianceType === 'openscap'
      ? 'Required by the selected OpenSCAP profile'
      : 'Required by the selected compliance policy'
    : 'Root partition is required';

  const handleValidation = (candidate: string) => {
    const parsed = validateMountpoint(candidate, blueprintMode);
    if (parsed.data === undefined || parsed.errors.length > 0) {
      return {
        data: parsed.data,
        errors: parsed.errors,
      };
    }

    const result = parsed.data;
    const { errors } = validateMountpointList(
      [
        ...mountpoints.filter((entry) => entry.id !== partition.id),
        { id: partition.id, mountpoint: result },
      ],
      blueprintMode,
    );

    return {
      data: parsed.data,
      errors: errors.filter(
        (issue) => issue.path && issue.path[0] === partition.id,
      ),
    };
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    event.currentTarget.blur();
  };

  const mountpointInput = (
    <ValidatedTextInput
      id={`mountpoint-${partition.id}`}
      ariaLabel='Mount point input'
      placeholder='Define mount point'
      value={mountpoint}
      isDisabled={isDisabled}
      inputProps={{ onKeyDown: handleKeyDown }}
      onChange={(_, value) => setMountpoint(value)}
      validator={handleValidation}
      onCommit={(mountpoint) => {
        if (!mountpoint) return;
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint,
          }),
        );
      }}
    />
  );

  return isOscapRequired || hasOneRoot ? (
    <Tooltip content={tooltipContent}>
      <div>{mountpointInput}</div>
    </Tooltip>
  ) : (
    mountpointInput
  );
};

export default Mountpoint;
