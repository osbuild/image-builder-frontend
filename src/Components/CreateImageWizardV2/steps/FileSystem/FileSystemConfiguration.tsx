import React, { useEffect, useState } from 'react';

import { Select, SelectOption } from '@patternfly/react-core/deprecated';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextInput } from '@patternfly/react-core/dist/dynamic/components/TextInput';
import { useWizardContext } from '@patternfly/react-core/dist/esm/components/Wizard/WizardContext';
import { WizardFooterWrapper } from '@patternfly/react-core/dist/esm/components/Wizard/WizardFooter';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import MinusCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/minus-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/plus-circle-icon';
import { Td, Tr } from '@patternfly/react-table';
import { v4 as uuidv4 } from 'uuid';

import FileSystemTable from './FileSystemTable';

import {
  FILE_SYSTEM_CUSTOMIZATION_URL,
  UNIT_GIB,
  UNIT_KIB,
  UNIT_MIB,
} from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  addPartition,
  changePartitionMinSize,
  changePartitionMountpoint,
  selectImageTypes,
  removePartition,
  selectPartitions,
  changePartitionUnit,
  setIsNextButtonTouched,
  selectIsNextButtonTouched,
  selectFileSystemPartitionMode,
} from '../../../../store/wizardSlice';
import UsrSubDirectoriesDisabled from '../../UsrSubDirectoriesDisabled';
import { ValidatedTextInput } from '../../ValidatedTextInput';
import {
  getDuplicateMountPoints,
  isFileSystemConfigValid,
  isMountpointMinSizeValid,
} from '../../validators';

export type Partition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

export const FileSystemStepFooter = () => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  const [isValid, setIsValid] = useState(false);
  const dispatch = useAppDispatch();
  const [isNextDisabled, setNextDisabled] = useState(false);
  const fileSystemPartitionMode = useAppSelector(selectFileSystemPartitionMode);
  const partitions = useAppSelector(selectPartitions);

  const onValidate = () => {
    dispatch(setIsNextButtonTouched(false));
    if (!isValid) {
      setNextDisabled(true);
    } else {
      goToNextStep();
    }
  };
  useEffect(() => {
    if (
      fileSystemPartitionMode === 'automatic' ||
      isFileSystemConfigValid(partitions)
    ) {
      setIsValid(true);
    } else setIsValid(false);
    setNextDisabled(false);
    dispatch(setIsNextButtonTouched(true));
  }, [partitions, fileSystemPartitionMode, dispatch]);
  return (
    <WizardFooterWrapper>
      <Button onClick={onValidate} isDisabled={isNextDisabled}>
        Next
      </Button>
      <Button variant="secondary" onClick={goToPrevStep}>
        Back
      </Button>
      <Button ouiaId="wizard-cancel-btn" variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

const FileSystemConfiguration = () => {
  const partitions = useAppSelector(selectPartitions);
  const environments = useAppSelector(selectImageTypes);

  const dispatch = useAppDispatch();

  const handleAddPartition = () => {
    const id = uuidv4();
    dispatch(
      addPartition({
        id,
        mountpoint: '/home',
        min_size: '1',
        unit: 'GiB',
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
            href={FILE_SYSTEM_CUSTOMIZATION_URL}
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
      <FileSystemTable />
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
  onDrop?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragStart?: (event: React.DragEvent<HTMLTableRowElement>) => void;
};

const normalizeSuffix = (rawSuffix: string) => {
  const suffix = rawSuffix.replace(/^\/+/g, '');
  return suffix.length > 0 ? '/' + suffix : '';
};

const getPrefix = (mountpoint: string) => {
  return mountpoint.split('/')[1] ? '/' + mountpoint.split('/')[1] : '/';
};
const getSuffix = (mountpoint: string) => {
  const prefix = getPrefix(mountpoint);
  return normalizeSuffix(mountpoint.substring(prefix.length));
};

export const Row = ({
  partition,
  onDragEnd,
  onDragStart,
  onDrop,
}: RowPropTypes) => {
  const dispatch = useAppDispatch();
  const partitions = useAppSelector(selectPartitions);
  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };
  const isNextButtonPristine = useAppSelector(selectIsNextButtonTouched);
  const duplicates = getDuplicateMountPoints(partitions);

  return (
    <Tr
      draggable
      id={partition.id}
      onDrop={onDrop}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Td
        draggableRow={{
          id: `draggable-row-${partition.id}`,
        }}
      />
      <Td className="pf-m-width-20">
        <MountpointPrefix partition={partition} />
        {!isNextButtonPristine &&
          duplicates.indexOf(partition.mountpoint) !== -1 && (
            <Alert
              variant="danger"
              isInline
              isPlain
              title="Duplicate mount point."
            />
          )}
      </Td>
      {partition.mountpoint !== '/' &&
      !partition.mountpoint.startsWith('/boot') &&
      !partition.mountpoint.startsWith('/usr') ? (
        <Td width={20}>
          <MountpointSuffix partition={partition} />
        </Td>
      ) : (
        <Td width={20} />
      )}

      <Td width={20}>xfs</Td>
      <Td width={20}>
        <MinimumSize partition={partition} />
      </Td>
      <Td width={10}>
        <SizeUnit partition={partition} />
      </Td>
      <Td width={10}>
        <Button
          variant="link"
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          ouiaId="remove-mount-point"
          isDisabled={partition.mountpoint === '/'}
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
    const mountpoint = selection + (suffix.length > 0 ? '/' + suffix : '');
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
      isDisabled={prefix === '/'}
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
      onChange={(event: React.FormEvent, newValue) => {
        const mountpoint = prefix + normalizeSuffix(newValue);
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
          })
        );
      }}
      aria-label="mountpoint suffix"
      ouiaId="mount-suffix"
    />
  );
};

type MinimumSizePropTypes = {
  partition: Partition;
};

export type Units = 'KiB' | 'MiB' | 'GiB';

export const getConversionFactor = (units: Units) => {
  switch (units) {
    case 'KiB':
      return UNIT_KIB;
    case 'MiB':
      return UNIT_MIB;
    case 'GiB':
      return UNIT_GIB;
  }
};

const MinimumSize = ({ partition }: MinimumSizePropTypes) => {
  const dispatch = useAppDispatch();

  return (
    <ValidatedTextInput
      ariaLabel="minimum partition size"
      helperText="Must be larger than 0"
      validator={isMountpointMinSizeValid}
      value={partition.min_size}
      type="text"
      ouiaId="size"
      onChange={(event, minSize) => {
        if (minSize === '' || /^\d+$/.test(minSize)) {
          dispatch(
            changePartitionMinSize({
              id: partition.id,
              min_size: minSize,
            })
          );
          dispatch(
            changePartitionUnit({ id: partition.id, unit: partition.unit })
          );
        }
      }}
    />
  );
};

type SizeUnitPropTypes = {
  partition: Partition;
};

const SizeUnit = ({ partition }: SizeUnitPropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = (event: React.MouseEvent, selection: Units) => {
    dispatch(changePartitionUnit({ id: partition.id, unit: selection }));
    setIsOpen(false);
  };

  return (
    <Select
      ouiaId="unit"
      isOpen={isOpen}
      onToggle={(_event, isOpen) => onToggle(isOpen)}
      onSelect={onSelect}
      selections={partition.unit}
    >
      <SelectOption value={'KiB'} />
      <SelectOption value={'MiB'} />
      <SelectOption value={'GiB'} />
    </Select>
  );
};

export default FileSystemConfiguration;
