import React, { useState } from 'react';

import {
  FormGroup,
  HelperText,
  HelperTextItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { FscModeType } from '@/Components/CreateImageWizard/steps/FileSystem';
import {
  changeFscMode,
  selectComplianceProfileID,
  selectFscMode,
} from '@/store/slices/wizard';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';

const fscModeOptions = [
  {
    value: 'automatic' as const,
    label: 'Automatic partitioning',
    description:
      'Automatically partition your image based on the target environment. The target environment sometimes dictates all or part of the partitioning scheme. Automatic partitioning applies the most current supported configuration layout.',
  },
  {
    value: 'basic' as const,
    label: 'Basic filesystem partitioning',
    description:
      'Create partitions for your image by defining mount points and minimum sizes. Image builder creates partitions with a logical volume (LVM) device type. The order of partitions may change when the image is installed in order to conform to best practices and ensure functionality.',
  },
  {
    value: 'advanced' as const,
    label: 'Advanced disk partitioning',
    description:
      'Define your file system using logical volumes and partitions. Create a volume group to gain granular control over partition sizes and mount points.',
  },
];

const FileSystemPartition = () => {
  const dispatch = useAppDispatch();
  const fscMode = useAppSelector(selectFscMode);
  const hasOscapProfile = useAppSelector(selectComplianceProfileID);
  const [isOpen, setIsOpen] = useState(false);

  if (hasOscapProfile) {
    return undefined;
  }

  const onSelect = (_event?: React.MouseEvent, selection?: string | number) => {
    dispatch(changeFscMode(selection as FscModeType));
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{ width: '100%' }}
    >
      {fscModeOptions.find((opt) => opt.value === fscMode)?.label}
    </MenuToggle>
  );

  return (
    <FormGroup label='Partitioning type'>
      <Select
        isOpen={isOpen}
        selected={fscMode}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        style={{ width: '60%' }}
      >
        <SelectList>
          {fscModeOptions.map((option) => (
            <SelectOption
              key={option.value}
              value={option.value}
              description={option.description}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      {fscMode === 'automatic' && (
        <HelperText className='pf-v6-u-pt-sm'>
          <HelperTextItem>
            <Icon status='info' size='sm'>
              <InfoCircleIcon />
            </Icon>{' '}
            Automatic partitioning is selected by default.
          </HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default FileSystemPartition;
