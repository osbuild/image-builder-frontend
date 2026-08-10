import React from 'react';

import { KNOWN_IMAGES } from '@/store/api/backend/onprem/constants';
import { useAppSelector } from '@/store/hooks';
import {
  selectImageSource,
  selectImageSourceType,
} from '@/store/slices/wizard';

import ContainerSection from './ContainerSection';
import RegistryAuth from './RegistryAuth';

// The target environment radios are the only way to choose an official
// image (the output slice resolves the image from the selected type);
// this section just shows what that choice maps to and lets the user
// pull it.
const OfficialImageSource = () => {
  const selectedRef = useAppSelector(selectImageSource);
  const imageSourceType = useAppSelector(selectImageSourceType);

  const selected = KNOWN_IMAGES.find((img) => img.reference === selectedRef);

  if (imageSourceType !== 'official') {
    return null;
  }

  return (
    <>
      <RegistryAuth />
      <ContainerSection
        label='Bootc container'
        reference={selected?.reference}
        name={selected?.name}
      />
    </>
  );
};

export default OfficialImageSource;
