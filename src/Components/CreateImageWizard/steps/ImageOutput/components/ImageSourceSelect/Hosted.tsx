import React from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import type { BootcDistributionItem } from '@/store/api/backend';

import ImageSourceError from './ImageSourceError';

type HostedImageSourceSelectProps = {
  distributions: BootcDistributionItem[] | undefined;
  selectedItem: BootcDistributionItem | undefined;
  imageSource: string | undefined;
  arch: string;
  isLoading: boolean;
  isError: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
};

const HostedImageSourceSelect = ({
  distributions,
  selectedItem,
  imageSource,
  arch,
  isLoading,
  isError,
  isOpen,
  onToggle,
  onOpenChange,
  onSelect,
}: HostedImageSourceSelectProps) => {
  // Filter out minor versions and deduplicate by name since the API
  // returns one entry per target type but the dropdown should show one
  // entry per base image.
  const uniqueDistributions = distributions
    ?.filter((d) => !d.name.includes('.'))
    .reduce<BootcDistributionItem[]>((acc, item) => {
      if (!acc.some((d) => d.name === item.name)) {
        acc.push(item);
      }
      return acc;
    }, []);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    if (isLoading) {
      return (
        <MenuToggle
          ref={toggleRef}
          isDisabled
          style={
            {
              minWidth: '20rem',
              maxWidth: '100%',
            } as React.CSSProperties
          }
        >
          <Spinner size='sm' aria-hidden='true' /> Loading bootc images...
        </MenuToggle>
      );
    }

    return (
      <MenuToggle
        ref={toggleRef}
        onClick={onToggle}
        isExpanded={isOpen}
        style={
          {
            minWidth: '20rem',
            maxWidth: '100%',
          } as React.CSSProperties
        }
      >
        {selectedItem ? selectedItem.name : 'Select a bootc image'}
      </MenuToggle>
    );
  };

  return (
    <FormGroup label='Image source' isRequired>
      {isError && <ImageSourceError isOnPremise={false} />}
      <Select
        isOpen={isOpen}
        selected={imageSource}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {!uniqueDistributions?.length && (
            <SelectOption isDisabled>
              No bootc images available for {arch}
            </SelectOption>
          )}
          {uniqueDistributions &&
            uniqueDistributions.length > 0 &&
            uniqueDistributions.map((item) => (
              <SelectOption key={item.reference} value={item.reference}>
                {item.name}
              </SelectOption>
            ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default HostedImageSourceSelect;
