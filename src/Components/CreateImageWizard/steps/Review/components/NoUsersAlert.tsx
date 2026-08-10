import React from 'react';

import { Alert, Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectImageTypes,
  selectIsImageMode,
  selectUsers,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

const DISK_IMAGE_TYPES: SupportedImageTypes[] = ['guest-image', 'aws', 'ami'];

const NoUsersAlert = () => {
  const isImageMode = useAppSelector(selectIsImageMode);
  const imageTypes = useAppSelector(selectImageTypes);
  const users = useAppSelector(selectUsers);

  const hasUser = users.some((user) => (user.name || '').trim() !== '');
  const isDiskImage = imageTypes.some((imageType) =>
    DISK_IMAGE_TYPES.includes(imageType),
  );

  if (!isImageMode || !isDiskImage || hasUser) {
    return null;
  }

  return (
    <Alert variant='warning' isInline title='No users added' ouiaId='NoUsers'>
      <Content component='p'>
        This image has no user accounts, so you won&apos;t be able to log in to
        it directly. To log in, use cloud-init to create a user when you launch
        the image, or go back to the Users step and add one now.
      </Content>
    </Alert>
  );
};

export default NoUsersAlert;
