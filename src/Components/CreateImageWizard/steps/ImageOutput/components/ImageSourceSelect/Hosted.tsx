import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import {
  type BootcDistributionItem,
  useGetDistributionsQuery,
} from '@/store/api/backend';
import { Distributions } from '@/store/api/backend/hosted';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changeBootcDistributions,
  changeDistribution,
  changeImageSource,
  selectArchitecture,
  selectImageSource,
} from '@/store/slices/wizard';

import ImageSourceError from './ImageSourceError';

const HostedImageSourceSelect = () => {
  const dispatch = useAppDispatch();
  const arch = useAppSelector(selectArchitecture);
  const imageSource = useAppSelector(selectImageSource);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: distributions,
    isLoading,
    isError,
  } = useGetDistributionsQuery({ kind: 'bootc', arch });

  const bootcDistributions = distributions as
    BootcDistributionItem[] | undefined;

  useEffect(() => {
    if (bootcDistributions) {
      dispatch(changeBootcDistributions(bootcDistributions));
    }
  }, [bootcDistributions, dispatch]);

  useEffect(() => {
    if (!bootcDistributions || bootcDistributions.length === 0) return;

    const hasSelected = imageSource
      ? bootcDistributions.some((d) => d.reference === imageSource)
      : false;
    if (hasSelected) return;

    const defaultItem =
      bootcDistributions.find((d) => d.distro.startsWith('rhel-10')) ??
      bootcDistributions[0];

    dispatch(changeImageSource(defaultItem.reference));
    dispatch(changeDistribution(defaultItem.distro as Distributions));
  }, [bootcDistributions, dispatch, imageSource]);

  const selectedItem = bootcDistributions?.find(
    (d) => d.reference === imageSource,
  );

  const onSelect = (_event?: React.MouseEvent, selection?: string | number) => {
    dispatch(changeImageSource(selection as string));
    const selected = bootcDistributions?.find((d) => d.reference === selection);
    if (selected) {
      dispatch(changeDistribution(selected.distro as Distributions));
    }
    setIsOpen(false);
  };

  // Filter out minor versions and deduplicate by name since the API
  // returns one entry per target type but the dropdown should show one
  // entry per base image.
  const uniqueDistributions = bootcDistributions
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
        onClick={() => setIsOpen((prev) => !prev)}
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
        onOpenChange={(open) => setIsOpen(open)}
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
