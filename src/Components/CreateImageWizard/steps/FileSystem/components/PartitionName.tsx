import React, { useEffect, useState } from 'react';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useAppDispatch } from '@/store/hooks';
import {
  changePartitionName,
  type LogicalVolume,
  validatePartitionName,
} from '@/store/slices/wizard';

type PartitionNameProps = {
  partition: Pick<LogicalVolume, 'id' | 'name'>;
};

const PartitionName = ({ partition }: PartitionNameProps) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(partition.name ?? '');

  useEffect(() => {
    // Reset the name when the partition changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(partition.name ?? '');
  }, [partition.name]);

  return (
    <ValidatedTextInput
      id={`name-${partition.id}`}
      ariaLabel='Partition name input'
      value={name}
      onChange={(_, value) => setName(value)}
      validator={(value) => validatePartitionName(value)}
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
