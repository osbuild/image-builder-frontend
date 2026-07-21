import React from 'react';

import type { BootcDistributionItem } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectArchitecture, selectImageSource } from '@/store/slices/wizard';

import HostedImageSourceSelect from './Hosted';
import OnPremImageSourceSelect from './OnPrem';

export type ImageSourceDropdownProps = {
  distributions: BootcDistributionItem[] | undefined;
  selectedItem: BootcDistributionItem | undefined;
  isLoading: boolean;
  isError: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
};

const ImageSourceDropdown = (props: ImageSourceDropdownProps) => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const imageSource = useAppSelector(selectImageSource);
  const arch = useAppSelector(selectArchitecture);

  if (isOnPremise) {
    return <OnPremImageSourceSelect />;
  }

  return (
    <HostedImageSourceSelect
      {...props}
      imageSource={imageSource}
      arch={arch}
      isError={props.isError}
    />
  );
};

export default ImageSourceDropdown;
