import React, { useEffect, useState } from 'react';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changePartitionName,
  type LogicalVolume,
  selectPartitionNames,
  validatePartitionName,
  validatePartitionNameList,
} from '@/store/slices/wizard';

type PartitionNameProps = {
  partition: Pick<LogicalVolume, 'id' | 'name'>;
};

const PartitionName = ({ partition }: PartitionNameProps) => {
  const dispatch = useAppDispatch();
  const partitionsNames = useAppSelector(selectPartitionNames);
  const [name, setName] = useState(partition.name ?? '');

  useEffect(() => {
    // Reset the name when the partition changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(partition.name ?? '');
  }, [partition.name]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    event.currentTarget.blur();
  };

  const handleValidation = (name: string) => {
    const parsed = validatePartitionName(name);
    if (!parsed.data || parsed.errors.length > 0) {
      return {
        data: parsed.data,
        errors: parsed.errors,
      };
    }

    const result = parsed.data;
    const { errors } = validatePartitionNameList([
      ...partitionsNames.filter((entry) => entry.id !== partition.id),
      { id: partition.id, name: result },
    ]);

    return {
      data: parsed.data,
      errors: errors.filter(
        (issue) => issue.path && issue.path[0] === partition.id,
      ),
    };
  };

  return (
    <ValidatedTextInput
      id={`name-${partition.id}`}
      ariaLabel='Partition name input'
      value={name}
      placeholder='Logical volume name'
      inputProps={{ onKeyDown: handleKeyDown }}
      onChange={(_, value) => setName(value)}
      validator={handleValidation}
      onCommit={(candidate) => {
        dispatch(
          changePartitionName({
            id: partition.id,
            name: candidate,
          }),
        );
      }}
    />
  );
};

export default PartitionName;
