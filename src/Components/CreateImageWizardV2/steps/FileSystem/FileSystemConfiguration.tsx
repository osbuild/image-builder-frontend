import React, { useState } from 'react';

import {
  Alert,
  Button,
  Popover,
  Text,
  TextContent,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import { Select, SelectOption } from '@patternfly/react-core/deprecated';
import {
  HelpIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { v4 as uuidv4 } from 'uuid';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  addPartition,
  changePartitionMinSize,
  changePartitionMountpoint,
  selectImageTypes,
  selectPartitions,
} from '../../../../store/wizardSlice';
import UsrSubDirectoriesDisabled from '../../UsrSubDirectoriesDisabled';
import { ValidatedTextInput } from '../../ValidatedTextInput';

export type Partition = {
  id: string;
  mountpoint: string;
  min_size: string;
};

const FileSystemConfiguration = () => {
  const partitions = useAppSelector((state) => selectPartitions(state));
  const environments = useAppSelector((state) => selectImageTypes(state));

  const dispatch = useAppDispatch();

  const handleAddPartition = () => {
    const id = uuidv4();
    dispatch(
      addPartition({
        id,
        mountpoint: '/home',
        min_size: '1',
      })
    );
  };

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h3}>Configure partitions</Text>
      </TextContent>
      {partitions?.find((partition) =>
        partition?.mountpoint?.includes('/usr')
      ) && <UsrSubDirectoriesDisabled />}
      <TextContent>
        <Text>
          Create partitions for your image by defining mount points and minimum
          sizes. Image builder creates partitions with a logical volume (LVM)
          device type.
        </Text>
        <Text>
          The order of partitions may change when the image is installed in
          order to conform to best practices and ensure functionality.
          <br></br>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_images_by_using_insights_image_builder/customizing-file-systems-during-the-image-creation"
            className="pf-u-pl-0"
          >
            Read more about manual configuration here
          </Button>
        </Text>
      </TextContent>
      {environments.includes('image-installer') && (
        <Alert
          variant="warning"
          isInline
          title="Filesystem customizations are not applied to 'Bare metal - Installer' images"
        />
      )}
      <Table aria-label="File system table" variant="compact">
        <Thead>
          <Tr>
            <Th />
            <Th>Mount point</Th>
            <Th></Th>
            <Th>Type</Th>
            <Th>
              Minimum size
              <Popover
                hasAutoWidth
                bodyContent={
                  <TextContent>
                    <Text>
                      Image Builder may extend this size based on requirements,
                      selected packages, and configurations.
                    </Text>
                  </TextContent>
                }
              >
                <Button
                  variant="plain"
                  aria-label="File system configuration info"
                  aria-describedby="file-system-configuration-info"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon />
                </Button>
              </Popover>
            </Th>
            <Th />
            <Th />
          </Tr>
        </Thead>
        <Tbody data-testid="file-system-configuration-tbody">
          {partitions &&
            partitions.map((partition) => (
              <Row key={partition.id} partition={partition} />
            ))}
        </Tbody>
      </Table>
      <TextContent>
        <Button
          ouiaId="add-partition"
          data-testid="file-system-add-partition"
          className="pf-u-text-align-left"
          variant="link"
          icon={<PlusCircleIcon />}
          onClick={handleAddPartition}
        >
          Add partition
        </Button>
      </TextContent>
    </>
  );
};

type RowPropTypes = {
  partition: Partition;
};

const getPrefix = (mountpoint: string) => {
  return mountpoint.split('/')[1] ? '/' + mountpoint.split('/')[1] : '/';
};
const getSuffix = (mountpoint: string) => {
  const prefix = getPrefix(mountpoint);
  return mountpoint.substring(prefix.length);
};

const Row = ({ partition }: RowPropTypes) => {
  const [units, setUnits] = useState<Units>('MiB');

  return (
    <Tr>
      <Td />
      <Td className="pf-m-width-15">
        <MountpointPrefix partition={partition} />
      </Td>
      <Td className="pf-m-width-15">
        <MountpointSuffix partition={partition} />
      </Td>
      <Td className="pf-m-width-20">xfs</Td>
      <Td className="pf-m-width-30">
        <MinimumSize partition={partition} units={units} />
      </Td>
      <Td className="pf-m-width-30">
        <SizeUnit units={units} setUnits={setUnits} />
      </Td>
      <Td className="pf-m-width-10">
        <Button
          variant="link"
          icon={<MinusCircleIcon />}
          onClick={() => {}}
          data-testid="remove-mount-point"
          isDisabled={true}
        />
      </Td>
    </Tr>
  );
};

export const mountpointPrefixes = [
  '/app',
  '/boot',
  '/data',
  '/home',
  '/opt',
  '/srv',
  '/tmp',
  '/usr',
  '/var',
];

type MountpointPrefixPropTypes = {
  partition: Partition;
};

const MountpointPrefix = ({ partition }: MountpointPrefixPropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const prefix = getPrefix(partition.mountpoint);
  const suffix = getSuffix(partition.mountpoint);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event: React.MouseEvent, selection: string) => {
    setIsOpen(false);
    const mountpoint = selection + suffix;
    dispatch(
      changePartitionMountpoint({ id: partition.id, mountpoint: mountpoint })
    );
  };

  return (
    <Select
      ouiaId="mount-point"
      isOpen={isOpen}
      onToggle={(_event, isOpen) => onToggle(isOpen)}
      onSelect={onSelect}
      selections={prefix}
    >
      {mountpointPrefixes.map((prefix, index) => {
        return <SelectOption key={index} value={prefix} />;
      })}
    </Select>
  );
};

type MountpointSuffixPropTypes = {
  partition: Partition;
};

const MountpointSuffix = ({ partition }: MountpointSuffixPropTypes) => {
  const dispatch = useAppDispatch();
  const prefix = getPrefix(partition.mountpoint);
  const suffix = getSuffix(partition.mountpoint);

  return (
    <TextInput
      value={suffix}
      type="text"
      onChange={(event: React.FormEvent, suffix) => {
        const mountpoint = prefix + suffix;
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
          })
        );
      }}
      aria-label="text input example"
    />
  );
};

type MinimumSizePropTypes = {
  partition: Partition;
  units: Units;
};

type Units = 'KiB' | 'MiB' | 'GiB';

const getConversionFactor = (units: Units) => {
  switch (units) {
    case 'KiB':
      return UNIT_KIB;
    case 'MiB':
      return UNIT_MIB;
    case 'GiB':
      return UNIT_GIB;
  }
};

const MinimumSize = ({ partition, units }: MinimumSizePropTypes) => {
  const conversionFactor = getConversionFactor(units);

  const convertToDisplayUnits = (minSize: string) => {
    return (parseInt(minSize) * conversionFactor).toString();
  };

  const convertToBytes = (minSize: string) => {
    return (parseInt(minSize) / conversionFactor).toString();
  };

  const dispatch = useAppDispatch();

  return (
    <ValidatedTextInput
      ariaLabel="minimum partition size"
      helperText=""
      validator={() => true}
      value={convertToDisplayUnits(partition.min_size)}
      type="text"
      onChange={(event, minSize) => {
        dispatch(
          changePartitionMinSize({
            id: partition.id,
            min_size: convertToBytes(minSize),
          })
        );
      }}
    />
  );
};

type SizeUnitPropTypes = {
  units: Units;
  setUnits: React.Dispatch<React.SetStateAction<Units>>;
};

const SizeUnit = ({ units, setUnits }: SizeUnitPropTypes) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event: React.MouseEvent, selection: Units) => {
    setUnits(selection);
    setIsOpen(false);
  };

  return (
    <Select
      ouiaId="mount-point"
      isOpen={isOpen}
      onToggle={(_event, isOpen) => onToggle(isOpen)}
      onSelect={onSelect}
      selections={units}
    >
      <SelectOption value={'KiB'} />
      <SelectOption value={'MiB'} />
      <SelectOption value={'GiB'} />
    </Select>
  );
};

export default FileSystemConfiguration;
