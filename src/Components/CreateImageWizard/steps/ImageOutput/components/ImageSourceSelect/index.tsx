import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';

import HostedImageSourceSelect from './Hosted';
import OnPremImageSourceSelect from './OnPrem';

const ImageSourceSelect = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);

  if (isOnPremise) {
    return <OnPremImageSourceSelect />;
  }

  return <HostedImageSourceSelect />;
};

export default ImageSourceSelect;
