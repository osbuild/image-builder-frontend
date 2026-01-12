import React from 'react';

import { Alert } from '@patternfly/react-core';

import { useAppSelector } from '../../store/hooks';
import { selectImageTypes } from '../../store/wizardSlice';

export const NetworkInstallerAlert = () => {
  const imageTypes = useAppSelector(selectImageTypes);
  const hasNetworkInstaller = imageTypes.includes('network-installer');

  if (!hasNetworkInstaller) {
    return null;
  }

  return (
    <Alert
      variant='warning'
      isInline
      title='Customization is not supported in network-installer'
    />
  );
};
