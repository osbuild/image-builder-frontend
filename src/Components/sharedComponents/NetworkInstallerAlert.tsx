import React from 'react';

import { Alert } from '@patternfly/react-core';

import { useHasNetworkInstaller } from '../CreateImageWizard/utilities/hasNetworkInstaller';

export const NetworkInstallerAlert = () => {
  const hasNetworkInstaller = useHasNetworkInstaller();

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
