import React from 'react';

import { Alert } from '@patternfly/react-core';

import { UNIT_GIB } from '../../constants';
import { ImageTypes } from '../../store/imageBuilderApi';

type FilesystemSizeAlertProps = {
  totalSizeBytes: number;
  imageTypes: ImageTypes[];
};

const FilesystemSizeAlert = ({
  totalSizeBytes,
  imageTypes,
}: FilesystemSizeAlertProps) => {
  const threshold = 99 * UNIT_GIB;

  // Only show alert for Azure and AWS targets
  const targetTypes: ImageTypes[] = ['aws', 'ami', 'azure'];
  const shouldShowAlert = imageTypes.some((type) => targetTypes.includes(type));

  if (totalSizeBytes <= threshold || !shouldShowAlert) {
    return null;
  }

  const totalSizeGB = Math.round((totalSizeBytes / UNIT_GIB) * 100) / 100;
  // Format: show decimals only if needed (e.g., "100GB" not "100.00GB")
  const formattedSize =
    totalSizeGB % 1 === 0 ? totalSizeGB.toFixed(0) : totalSizeGB.toFixed(2);

  return (
    <Alert
      variant='info'
      isInline
      title={`The size of the filesystem (${formattedSize}GB) you are requesting may lead to long build and upload times.`}
    />
  );
};

export default FilesystemSizeAlert;
