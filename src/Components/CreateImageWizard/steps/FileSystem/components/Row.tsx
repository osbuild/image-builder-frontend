import React from 'react';

import { Alert, Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import MinimumSize from './MinimumSize';
import MountpointPrefix from './MountpointPrefix';
import MountpointSubpath from './MountpointSubpath';
import SizeUnit from './SizeUnit';

import { useAppDispatch } from '../../../../../store/hooks';
import { removePartition } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { FilesystemPartition } from '../fscTypes';

export const FileSystemContext = React.createContext<boolean>(true);

type RowPropTypes = {
  partition: FilesystemPartition;
  isRemovingDisabled: boolean;
};

const Row = ({ partition, isRemovingDisabled }: RowPropTypes) => {
  const dispatch = useAppDispatch();
  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };
  const stepValidation = useFilesystemValidation();
  const isPristine = React.useContext(FileSystemContext);

  const customization = 'fileSystem';

  return (
    <Tr id={partition.id}>
      <Td className='pf-m-width-20'>
        <MountpointPrefix partition={partition} customization={customization} />
        {!isPristine && stepValidation.errors[`mountpoint-${partition.id}`] && (
          <Alert
            variant='danger'
            isInline
            isPlain
            title={stepValidation.errors[`mountpoint-${partition.id}`]}
            className='pf-v6-u-pt-sm'
          />
        )}
      </Td>
      {partition.mountpoint !== '/' &&
      !partition.mountpoint.startsWith('/boot') &&
      !partition.mountpoint.startsWith('/usr') ? (
        <Td width={20}>
          <MountpointSubpath
            partition={partition}
            customization={customization}
          />
        </Td>
      ) : (
        <Td width={20} />
      )}

      <Td width={20}>xfs</Td>
      <Td width={20}>
        <MinimumSize partition={partition} customization={customization} />
      </Td>
      <Td width={10}>
        <SizeUnit partition={partition} customization={customization} />
      </Td>
      <Td width={10}>
        <Button
          variant='link'
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          isDisabled={isRemovingDisabled}
        />
      </Td>
    </Tr>
  );
};

export default Row;
