import React, { useMemo, useState } from 'react';

import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';

import { simpleTargetNames } from '@/constants';
import type { BootcDistributionItem } from '@/store/api/backend';
import { isImageType } from '@/store/slices/wizard';

import { groupByName } from './groupByName';
import RegistryAuth from './RegistryAuth';

import ImageSourceError from '../ImageSourceError';
import './OnPrem.css';

type OnPremImageSourceSelectProps = {
  distributions: BootcDistributionItem[] | undefined;
  selectedItem: BootcDistributionItem | undefined;
  isLoading: boolean;
  isError: boolean;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  onRefresh: () => void;
};

const OnPremImageSourceSelect = ({
  distributions,
  selectedItem,
  isLoading,
  isError,
  onSelect,
  onRefresh,
}: OnPremImageSourceSelectProps) => {
  const grouped = useMemo(
    () => (distributions ? groupByName(distributions) : []),
    [distributions],
  );

  // Local group selection tracks the user's explicit choice.
  // Falls back to the store's selected item name so the dropdown is
  // pre-filled on mount after the parent auto-selects a default.
  const [localGroupName, setLocalGroupName] = useState<string>();
  const [isDistroOpen, setIsDistroOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const activeGroupName = localGroupName ?? selectedItem?.name;
  const selectedGroup = grouped.find((g) => g.name === activeGroupName);

  const onDistroSelect = (
    _event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    const groupName = selection as string;
    setLocalGroupName(groupName);
    setIsDistroOpen(false);

    const group = grouped.find((g) => g.name === groupName);
    if (group?.items.length === 1) {
      onSelect(undefined, group.items[0].reference);
    }
  };

  const onImageSelect = (
    _event?: React.MouseEvent,
    selection?: string | number,
  ) => {
    onSelect(undefined, selection);
    setIsImageOpen(false);
  };

  const toggleStyle = {
    minWidth: '20rem',
    maxWidth: '100%',
  } as React.CSSProperties;

  const distroToggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    if (isLoading) {
      return (
        <MenuToggle ref={toggleRef} isDisabled style={toggleStyle}>
          <Spinner size='sm' aria-hidden='true' /> Loading bootc images...
        </MenuToggle>
      );
    }

    return (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsDistroOpen((prev) => !prev)}
        isExpanded={isDistroOpen}
        style={toggleStyle}
      >
        {activeGroupName ?? 'Select a distribution'}
      </MenuToggle>
    );
  };

  const imageToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsImageOpen((prev) => !prev)}
      isExpanded={isImageOpen}
      isDisabled={!selectedGroup}
      style={toggleStyle}
    >
      {selectedItem && selectedItem.name === activeGroupName
        ? selectedItem.reference
        : 'Select an image'}
    </MenuToggle>
  );

  return (
    <>
      <FormGroup label='Release' isRequired>
        <Select
          isOpen={isDistroOpen}
          selected={activeGroupName}
          onSelect={onDistroSelect}
          onOpenChange={setIsDistroOpen}
          toggle={distroToggle}
          shouldFocusToggleOnSelect
        >
          <SelectList>
            {grouped.length === 0 && (
              <SelectOption isDisabled>No bootc images available</SelectOption>
            )}
            {grouped.map((group) => (
              <SelectOption key={group.name} value={group.name}>
                {group.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </FormGroup>
      <FormGroup label='Image source' isRequired>
        {isError && <ImageSourceError isOnPremise />}
        <Flex>
          <FlexItem>
            <Select
              isOpen={isImageOpen}
              selected={selectedItem?.reference}
              onSelect={onImageSelect}
              onOpenChange={setIsImageOpen}
              toggle={imageToggle}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                {selectedGroup?.items.map((item) => (
                  <SelectOption
                    key={item.reference}
                    value={item.reference}
                    className='on-prem-image-item'
                    description={
                      <Label color='blue' isCompact>
                        {isImageType(item.type)
                          ? simpleTargetNames[item.type]
                          : item.type}
                      </Label>
                    }
                  >
                    {item.reference}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>
          <FlexItem>
            <Button
              variant='plain'
              icon={<SyncAltIcon />}
              onClick={onRefresh}
              isDisabled={isLoading}
              isInline
              aria-label='Refresh image sources'
            />
          </FlexItem>
        </Flex>
        <RegistryAuth />
      </FormGroup>
    </>
  );
};

export default OnPremImageSourceSelect;
