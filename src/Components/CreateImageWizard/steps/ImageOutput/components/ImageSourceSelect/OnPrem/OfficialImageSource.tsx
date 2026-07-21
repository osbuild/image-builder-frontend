import React from 'react';

import type { BootcDistributionItem } from '@/store/api/backend';
import { useAppSelector } from '@/store/hooks';
import { selectImageSourceType } from '@/store/slices';

import ImageSelect from './ImageSelect';
import RegistryAuth from './RegistryAuth';

type OfficialImageSourceProps = {
  images: BootcDistributionItem[];
  selectedRef: string | undefined;
  isLoading: boolean;
  onSelect: (event?: React.MouseEvent, selection?: string | number) => void;
  onRefresh: () => void;
};

const OfficialImageSource = ({
  images,
  selectedRef,
  isLoading,
  onSelect,
  onRefresh,
}: OfficialImageSourceProps) => {
  const imageSourceType = useAppSelector(selectImageSourceType);

  if (imageSourceType !== 'official') {
    return null;
  }

  return (
    <>
      <ImageSelect
        items={images}
        selectedRef={selectedRef}
        onSelect={onSelect}
        getLabel={(item) => item.name}
        placeholder={
          images.length === 0
            ? 'Log in to view official images'
            : 'Select an official image'
        }
        isLoading={isLoading}
        isDisabled={images.length === 0}
      />
      <RegistryAuth onLoginSuccess={onRefresh} />
    </>
  );
};

export default OfficialImageSource;
