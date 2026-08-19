import React from 'react';

import { Alert, Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectImageTypes,
  selectUsers,
  type SupportedImageTypes,
} from '@/store/slices/wizard';

type UserProvisioning = 'launch' | 'prompt' | 'none';

const USER_PROVISIONING: Partial<
  Record<SupportedImageTypes, UserProvisioning>
> = {
  aws: 'launch',
  ami: 'launch',
  azure: 'launch',
  vhd: 'launch',
  gcp: 'launch',
  oci: 'launch',
  vsphere: 'launch',
  'vsphere-ova': 'launch',
  'guest-image': 'launch',
  'image-installer': 'prompt',
  wsl: 'prompt',
  'pxe-tar-xz': 'none',
};

const MESSAGES: Record<
  UserProvisioning,
  { title: string; body: React.ReactNode }
> = {
  launch: {
    title: 'No users added',
    body: (
      <>
        This image has no user accounts, so you won&apos;t be able to log in to
        it directly. To log in, use cloud-init or your cloud provider&apos;s
        instance metadata to create a user when you launch the image, or go back
        to the Users step and add one now.
      </>
    ),
  },
  prompt: {
    title: 'No users added',
    body: (
      <>
        This image has no user accounts. You will be asked to create one the
        first time you set the image up, or you can go back to the Users step
        and add one now.
      </>
    ),
  },
  none: {
    title: 'No users added and no way to add one later',
    body: (
      <>
        This image has no user accounts, and nothing will offer to create one. A
        PXE-booted system starts from a read-only image with no installer and no
        cloud-init, and any account you create afterwards is lost on the next
        boot. Go back to the Users step and add a user now, or you will not be
        able to log in at all.
      </>
    ),
  },
};

const BY_SEVERITY: UserProvisioning[] = ['none', 'launch', 'prompt'];

const NoUsersAlert = () => {
  const imageTypes = useAppSelector(selectImageTypes);
  const users = useAppSelector(selectUsers);

  const hasUser = users.some((user) => (user.name || '').trim() !== '');
  const provisioning = BY_SEVERITY.find((level) =>
    imageTypes.some((imageType) => USER_PROVISIONING[imageType] === level),
  );

  if (hasUser || !provisioning) {
    return null;
  }

  const { title, body } = MESSAGES[provisioning];

  return (
    <Alert
      variant={provisioning === 'prompt' ? 'info' : 'warning'}
      isInline
      title={title}
      ouiaId='NoUsers'
    >
      <Content component='p'>{body}</Content>
    </Alert>
  );
};

export default NoUsersAlert;
