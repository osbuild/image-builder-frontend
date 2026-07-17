import React from 'react';

import {
  Button,
  Split,
  SplitItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { useGetOscapCustomizationsQuery } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  FilesystemPartition,
  parseSizeUnit,
  removePartition,
  selectComplianceProfileID,
  selectDistribution,
} from '@/store/slices/wizard';

import MinimumSize from './MinimumSize';
import Mountpoint from './Mountpoint';
import SizeUnit from './SizeUnit';

export const FileSystemContext = React.createContext<boolean>(true);

type RowPropTypes = {
  partition: FilesystemPartition;
  isRemovingDisabled: boolean;
};

const Row = ({ partition, isRemovingDisabled }: RowPropTypes) => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);

  const { data: oscapProfileInfo } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-expect-error skipped when undefined
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const oscapPartition = oscapProfileInfo?.filesystem?.find(
    (fs) => fs.mountpoint === partition.mountpoint,
  );
  const isOscapRequired = !!oscapPartition;

  const oscapMinSizeLabel = oscapPartition
    ? parseSizeUnit(String(oscapPartition.min_size)).join(' ')
    : '';

  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };

  const customization = 'fileSystem';

  const removeButton = (
    <Button
      isDisabled={isOscapRequired || isRemovingDisabled}
      variant='plain'
      icon={isRemovingDisabled ? <LockIcon /> : <MinusCircleIcon />}
      onClick={() => handleRemovePartition(partition.id)}
      aria-label='Remove partition'
    />
  );

  return (
    <Tr id={partition.id}>
      <Td width={40}>
        <Mountpoint
          partition={partition}
          customization={customization}
          isOscapRequired={isOscapRequired}
        />
      </Td>
      <Td width={20}>
        <TextInput
          value='xfs'
          type='text'
          aria-label='Partition type'
          isDisabled
        />
      </Td>
      <Td width={40}>
        <Split hasGutter>
          <SplitItem isFilled>
            <MinimumSize
              partition={partition}
              customization={customization}
              isOscapRequired={isOscapRequired}
              oscapMinSizeLabel={oscapMinSizeLabel}
            />
          </SplitItem>
          <SplitItem>
            <SizeUnit
              partition={partition}
              customization={customization}
              isOscapRequired={isOscapRequired}
            />
          </SplitItem>
        </Split>
      </Td>
      <Td isActionCell>
        {isOscapRequired ? (
          <Tooltip content='Required by the selected OpenSCAP profile'>
            <span>{removeButton}</span>
          </Tooltip>
        ) : (
          removeButton
        )}
      </Td>
    </Tr>
  );
};

export default Row;
