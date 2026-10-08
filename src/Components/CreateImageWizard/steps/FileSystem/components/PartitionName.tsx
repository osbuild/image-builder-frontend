import React from 'react';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { useAppDispatch } from '@/store/hooks';
import { changePartitionName, type LogicalVolume } from '@/store/slices/wizard';

type PartitionNameProps = {
  partition: Pick<LogicalVolume, 'id' | 'name'>;
};

const PartitionName = ({ partition }: PartitionNameProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='Partition name input'
      value={partition.name || ''}
      onChange={(_, name) => {
        dispatch(
          changePartitionName({
            id: partition.id,
            name: name,
          }),
        );
      }}
      stepValidation={stepValidation}
      fieldName={`name-${partition.id}`}
    />
  );
};

export default PartitionName;
